import { Client, DocType, ClientImportRow, IvaCondition } from '../../types/client.ts';
import { normalizeDocNumber, validateDoc } from '../../utils/doc.ts';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, writeBatch } from "firebase/firestore";


const getClientsCollection = (userId: string) => collection(db, 'users', userId, 'clients');

const DEMO_CLIENTS: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Juan Pérez', docType: 'DNI', docNumber: '30123456', ivaCondition: 'CF', active: true, email: 'juan.perez@example.com', phone: '1122334455', address: 'Av. Corrientes 1234, CABA' },
    { name: 'Librería San Martín SRL', docType: 'CUIT', docNumber: '30712345678', ivaCondition: 'RI', active: true, email: 'compras@libreriasm.com', phone: '1198765432', address: 'Florida 500, CABA' },
    { name: 'María Gómez', docType: 'DNI', docNumber: '28333444', ivaCondition: 'MONOTRIBUTO', active: false, email: 'maria.gomez@example.com', phone: '1133445566', address: '' },
];

// --- Public API ---

export const list = async (userId: string): Promise<Client[]> => {
    const querySnapshot = await getDocs(getClientsCollection(userId));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

export const getById = async (userId: string, id: string): Promise<Client | null> => {
    const docRef = doc(db, 'users', userId, 'clients', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Client : null;
};

export const create = async (userId: string, data: Omit<Client, 'id'|'createdAt'|'updatedAt'>): Promise<Client> => {
    if (!data.name.trim()) throw new Error("El nombre es obligatorio.");
    
    const normalizedDoc = normalizeDocNumber(data.docNumber);
    const validation = validateDoc(data.docType, normalizedDoc);
    if (!validation.ok) throw new Error(validation.message);
    
    if (data.docType !== 'SD' && normalizedDoc) {
        const clientsRef = getClientsCollection(userId);
        const q = query(clientsRef, where("docType", "==", data.docType), where("docNumber", "==", normalizedDoc));
        const existing = await getDocs(q);
        if (!existing.empty) {
            throw new Error(`Ya existe un cliente con ${data.docType} ${data.docNumber}.`);
        }
    }

    const newClientData = {
        ...data,
        docNumber: normalizedDoc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(getClientsCollection(userId), newClientData);
    return { id: docRef.id, ...newClientData };
};

export const update = async (userId: string, id: string, patch: Partial<Client>): Promise<Client> => {
    const clientRef = doc(db, 'users', userId, 'clients', id);
    
    if (patch.docNumber || patch.docType) {
        const clientSnap = await getDoc(clientRef);
        const currentData = clientSnap.data() as Client;
        const newDocType = patch.docType || currentData.docType;
        const newDocNumber = patch.docNumber !== undefined ? normalizeDocNumber(patch.docNumber) : normalizeDocNumber(currentData.docNumber);

        const validation = validateDoc(newDocType, newDocNumber);
        if (!validation.ok) throw new Error(validation.message);
        
        if (newDocType !== 'SD' && newDocNumber) {
            const clientsRef = getClientsCollection(userId);
            const q = query(clientsRef, where("docType", "==", newDocType), where("docNumber", "==", newDocNumber));
            const existing = await getDocs(q);
            if (!existing.empty && existing.docs[0].id !== id) {
                throw new Error(`Ya existe otro cliente con ${newDocType} ${newDocNumber}.`);
            }
        }
        if(patch.docNumber !== undefined) patch.docNumber = newDocNumber;
    }

    await updateDoc(clientRef, { ...patch, updatedAt: new Date().toISOString() });
    const updatedSnap = await getDoc(clientRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Client;
};

export const deactivate = async (userId: string, id: string): Promise<Client> => {
    const clientRef = doc(db, 'users', userId, 'clients', id);
    const clientSnap = await getDoc(clientRef);
    const client = clientSnap.data() as Client;
    await updateDoc(clientRef, { active: !client.active, updatedAt: new Date().toISOString() });
    return { ...client, id, active: !client.active };
};

export const createQuick = async (
    userId: string,
    name: string, 
    docType: Client['docType'], 
    docNumber: string
): Promise<Client> => {
    return create(userId, {
        name,
        docType,
        docNumber,
        ivaCondition: 'CF',
        active: true
    });
};

export const batchCreate = async (userId: string, data: ClientImportRow[]) => {
    const result = { successCount: 0, errors: [] as { item: any; reason: string }[] };

    for(const row of data) {
        try {
            const clientData: Omit<Client, 'id'|'createdAt'|'updatedAt'> = {
                name: row.name || '',
                docType: row.docType || 'DNI',
                docNumber: row.docNumber || '',
                ivaCondition: row.ivaCondition || 'CF',
                email: row.email,
                phone: row.phone,
                address: row.address,
                notes: row.notes,
                active: row.active ?? true,
            };
            await create(userId, clientData);
            result.successCount++;
        } catch (e) {
            result.errors.push({ item: row, reason: e instanceof Error ? e.message : 'Error desconocido' });
        }
    }
    return result;
};

export const seedIfEmpty = async (userId: string): Promise<void> => {
    const currentClients = await list(userId);
    if (currentClients.length === 0) {
        const batch = writeBatch(db);
        const clientsRef = getClientsCollection(userId);
        DEMO_CLIENTS.forEach(clientData => {
            const docRef = doc(clientsRef);
            batch.set(docRef, {
                ...clientData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });
        await batch.commit();
    }
};
