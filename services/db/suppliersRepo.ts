import { Supplier, SupplierImportRow, DocTypeSupplier, IvaCondition, PaymentTerms, SupplierImportResult } from '../../types/supplier';
import { normalizeCUIT, validateSupplierDoc } from '../../utils/doc';
import { normalizeCBU, normalizeAlias, isValidCBU } from '../../utils/bank';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, writeBatch } from "firebase/firestore";

const getSuppliersCollection = (userId: string) => collection(db, 'users', userId, 'suppliers');

const DEMO_SUPPLIERS: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { businessName: 'Papeles Cuyanos SA', docType: 'CUIT', cuit: '30712345678', ivaCondition: 'RI', active: true, email: 'contacto@papelescuyanos.com', phone: '2614567890', address: 'Carril Rodriguez Peña 2130', city: 'Maipú', province: 'Mendoza', postalCode: '5515', contactName: 'Carlos Rivera', paymentTerms: 'CTA_CTE_30', bank: { bankName: 'Banco Nación', cbu: '0110599520000012345678', alias: 'PAPELES.CUYO.SA' }, notes: 'Principal proveedor de resmas A4.' },
    { businessName: 'Insumos Andes SRL', docType: 'CUIT', cuit: '30709998883', ivaCondition: 'RI', active: true, email: 'ventas@insumosandes.com', phone: '1155667788', address: 'Av. San Martín 950', city: 'CABA', province: 'Buenos Aires', postalCode: '1004', contactName: 'Ana Torres', paymentTerms: 'CONTADO', bank: { bankName: 'Banco Galicia', cbu: '0070021220000012345678', alias: 'ANDES.SRL' }, notes: '' },
];

export const list = async (userId: string): Promise<Supplier[]> => {
    const querySnapshot = await getDocs(getSuppliersCollection(userId));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
};

export const getById = async (userId: string, id: string): Promise<Supplier | null> => {
    const docRef = doc(db, 'users', userId, 'suppliers', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Supplier : null;
};

export const create = async (userId: string, data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    if (!data.businessName.trim()) throw new Error("La Razón Social es obligatoria.");

    const normalizedCuit = normalizeCUIT(data.cuit);
    const docValidation = validateSupplierDoc(data.docType, normalizedCuit);
    if (!docValidation.ok) throw new Error(docValidation.message);

    if (data.docType === 'CUIT') {
        const suppliersRef = getSuppliersCollection(userId);
        const q = query(suppliersRef, where("cuit", "==", normalizedCuit));
        const existing = await getDocs(q);
        if (!existing.empty) throw new Error(`Ya existe un proveedor con el CUIT ${data.cuit}.`);
    }

    if (data.bank?.cbu && !isValidCBU(data.bank.cbu)) {
        throw new Error("El CBU debe tener 22 dígitos.");
    }
    
    const newSupplierData = {
        ...data,
        cuit: normalizedCuit,
        bank: data.bank ? {
            ...data.bank,
            cbu: normalizeCBU(data.bank.cbu || ''),
            alias: normalizeAlias(data.bank.alias || ''),
        } : {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(getSuppliersCollection(userId), newSupplierData);
    return { id: docRef.id, ...newSupplierData };
};

export const update = async (userId: string, id: string, patch: Partial<Supplier>): Promise<Supplier> => {
    const supplierRef = doc(db, 'users', userId, 'suppliers', id);

    if (patch.cuit || patch.docType) {
        const supplierSnap = await getDoc(supplierRef);
        const currentData = supplierSnap.data() as Supplier;
        const newDocType = patch.docType || currentData.docType;
        const newCuit = patch.cuit !== undefined ? normalizeCUIT(patch.cuit) : normalizeCUIT(currentData.cuit);
        
        const docValidation = validateSupplierDoc(newDocType, newCuit);
        if (!docValidation.ok) throw new Error(docValidation.message);
        
        if (newDocType === 'CUIT') {
            const suppliersRef = getSuppliersCollection(userId);
            const q = query(suppliersRef, where("cuit", "==", newCuit));
            const existing = await getDocs(q);
            if (!existing.empty && existing.docs[0].id !== id) {
                throw new Error(`Ya existe otro proveedor con el CUIT ${newCuit}.`);
            }
        }
        if (patch.cuit !== undefined) patch.cuit = newCuit;
    }

    if (patch.bank?.cbu && !isValidCBU(patch.bank.cbu)) {
        throw new Error("El CBU debe tener 22 dígitos.");
    }

    await updateDoc(supplierRef, { ...patch, updatedAt: new Date().toISOString() });
    const updatedSnap = await getDoc(supplierRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Supplier;
};

export const deactivate = async (userId: string, id: string): Promise<Supplier> => {
    const supplierRef = doc(db, 'users', userId, 'suppliers', id);
    const supplierSnap = await getDoc(supplierRef);
    const supplier = supplierSnap.data() as Supplier;
    await updateDoc(supplierRef, { active: !supplier.active, updatedAt: new Date().toISOString() });
    return { ...supplier, id, active: !supplier.active };
};

export const seedIfEmpty = async (userId: string): Promise<void> => {
    const currentSuppliers = await list(userId);
    if (currentSuppliers.length === 0) {
        const batch = writeBatch(db);
        const suppliersRef = getSuppliersCollection(userId);
        DEMO_SUPPLIERS.forEach(supplierData => {
            const docRef = doc(suppliersRef);
            batch.set(docRef, {
                ...supplierData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });
        await batch.commit();
    }
};

export const batchCreate = async (userId: string, data: SupplierImportRow[]): Promise<SupplierImportResult> => {
    const result: SupplierImportResult = { successCount: 0, errors: [] };

    for(const row of data) {
        try {
            const supplierData: Omit<Supplier, 'id'|'createdAt'|'updatedAt'> = {
                businessName: row.businessName || '',
                docType: row.docType || 'CUIT',
                cuit: row.cuit || '',
                ivaCondition: row.ivaCondition || 'RI',
                email: row.email,
                phone: row.phone,
                address: row.address,
                city: row.city,
                province: row.province,
                postalCode: row.postalCode,
                contactName: row.contactName,
                paymentTerms: row.paymentTerms || 'CONTADO',
                bank: {
                    bankName: row['bank.bankName'],
                    cbu: row['bank.cbu'],
                    alias: row['bank.alias'],
                },
                notes: row.notes,
                active: row.active ?? true,
            };
            await create(userId, supplierData);
            result.successCount++;
        } catch (e) {
            result.errors.push({ item: row, reason: e instanceof Error ? e.message : 'Error desconocido' });
        }
    }
    return result;
};
