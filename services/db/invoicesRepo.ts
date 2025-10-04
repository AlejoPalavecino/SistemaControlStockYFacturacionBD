import { Invoice, InvoiceStatus, InvoiceId } from '../../types/invoice.ts';
import * as numberingRepo from './numberingRepo.ts';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";

const getInvoicesCollection = (userId: string) => collection(db, 'users', userId, 'invoices');

// --- Public API ---

export const list = async (userId: string): Promise<Invoice[]> => {
    const querySnapshot = await getDocs(getInvoicesCollection(userId));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
};

export const listByClient = async (userId: string, clientId: string): Promise<Invoice[]> => {
    const q = query(getInvoicesCollection(userId), where("clientId", "==", clientId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
};

export const getById = async (userId: string, id: InvoiceId): Promise<Invoice | null> => {
    const docRef = doc(db, 'users', userId, 'invoices', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Invoice : null;
};

export const create = async (userId: string, draftData: Partial<Omit<Invoice, 'id'|'createdAt'|'updatedAt'|'number'|'status'>>): Promise<Invoice> => {
    const pos = draftData.pos || '0001';
    const nextNumber = await numberingRepo.getNextInvoiceNumber(userId, pos);
    
    const newInvoiceData: Omit<Invoice, 'id'> = {
        type: draftData.type || 'B',
        concept: draftData.concept || 'PRODUCTOS',
        pos: pos,
        number: nextNumber, // Preview number
        clientId: draftData.clientId || '',
        clientName: draftData.clientName || '',
        clientDocType: draftData.clientDocType || 'DNI',
        clientDocNumber: draftData.clientDocNumber || '',
        items: draftData.items || [],
        totals: draftData.totals || { netARS: 0, ivaARS: 0, totalARS: 0 },
        paymentMethod: draftData.paymentMethod || 'EFECTIVO',
        status: 'BORRADOR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(getInvoicesCollection(userId), newInvoiceData);
    return { id: docRef.id, ...newInvoiceData };
};

export const update = async (userId: string, id: InvoiceId, patch: Partial<Invoice>): Promise<Invoice> => {
    const invoiceRef = doc(db, 'users', userId, 'invoices', id);
    const invoiceSnap = await getDoc(invoiceRef);
    if (!invoiceSnap.exists() || invoiceSnap.data().status !== 'BORRADOR') {
        throw new Error("Only draft invoices can be updated.");
    }
    await updateDoc(invoiceRef, { ...patch, updatedAt: new Date().toISOString() });
    const updatedSnap = await getDoc(invoiceRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Invoice;
};

export const issue = async (userId: string, finalDraftData: Invoice): Promise<Invoice> => {
    const invoiceRef = doc(db, 'users', userId, 'invoices', finalDraftData.id);
    const invoiceSnap = await getDoc(invoiceRef);
    if (!invoiceSnap.exists() || invoiceSnap.data().status !== 'BORRADOR') {
        throw new Error('Only draft invoices can be issued.');
    }

    const issuedNumber = await numberingRepo.incrementInvoiceNumber(userId, finalDraftData.pos);
    
    const issuedInvoiceData = {
        ...finalDraftData,
        status: 'EMITIDA' as InvoiceStatus,
        number: issuedNumber,
        cae: Date.now().toString() + Math.floor(Math.random() * 100),
        caeDue: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 7);
            return d.toISOString();
        })(),
        updatedAt: new Date().toISOString(),
    };
    
    // We update the existing doc instead of creating a new one
    await updateDoc(invoiceRef, issuedInvoiceData);

    return { ...finalDraftData, ...issuedInvoiceData };
};

export const setStatus = async (userId: string, id: InvoiceId, status: InvoiceStatus): Promise<Invoice> => {
    if (status === 'EMITIDA') {
        throw new Error("Internal error: Use the `issue` function to set status to EMITIDA.");
    }
    const invoiceRef = doc(db, 'users', userId, 'invoices', id);
    await updateDoc(invoiceRef, { status, updatedAt: new Date().toISOString() });
    const updatedSnap = await getDoc(invoiceRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Invoice;
};

export const remove = async (userId: string, id: InvoiceId): Promise<void> => {
    const invoiceRef = doc(db, 'users', userId, 'invoices', id);
    const invoiceSnap = await getDoc(invoiceRef);
    if (!invoiceSnap.exists() || invoiceSnap.data().status !== 'BORRADOR') {
        throw new Error("Only draft invoices can be removed.");
    }
    await deleteDoc(invoiceRef);
};

export const hasInvoicesForClient = async (userId: string, clientId: string): Promise<boolean> => {
    const q = query(getInvoicesCollection(userId), where("clientId", "==", clientId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};
