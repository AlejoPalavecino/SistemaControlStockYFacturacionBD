import { Purchase } from '../../types/purchase.ts';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

const getPurchasesCollection = (userId: string) => collection(db, 'users', userId, 'purchases');

export const list = async (userId: string): Promise<Purchase[]> => {
    const querySnapshot = await getDocs(getPurchasesCollection(userId));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
};

export const listBySupplier = async (userId: string, supplierId: string): Promise<Purchase[]> => {
    const q = query(getPurchasesCollection(userId), where("supplierId", "==", supplierId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
};

export const create = async (userId: string, data: Omit<Purchase, 'id' | 'createdAt'>): Promise<Purchase> => {
    if (data.totalAmountARS <= 0) throw new Error("El monto de la compra debe ser positivo.");
    
    const newPurchaseData = {
        ...data,
        createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(getPurchasesCollection(userId), newPurchaseData);
    return { id: docRef.id, ...newPurchaseData };
};