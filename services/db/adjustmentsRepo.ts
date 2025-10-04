import { AccountAdjustment } from '../../types/adjustment.ts';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

const getAdjustmentsCollection = (userId: string) => collection(db, 'users', userId, 'adjustments');

export const list = async (userId: string): Promise<AccountAdjustment[]> => {
    const querySnapshot = await getDocs(getAdjustmentsCollection(userId));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccountAdjustment));
};

export const listByClient = async (userId: string, clientId: string): Promise<AccountAdjustment[]> => {
    const q = query(getAdjustmentsCollection(userId), where("clientId", "==", clientId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccountAdjustment));
};

export const create = async (userId: string, data: Omit<AccountAdjustment, 'id' | 'createdAt'>): Promise<AccountAdjustment> => {
    if (data.amountARS <= 0) throw new Error("El monto del ajuste debe ser positivo.");
    if (!data.description) throw new Error("La descripción es obligatoria.");

    const newAdjustmentData = {
        ...data,
        createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(getAdjustmentsCollection(userId), newAdjustmentData);
    return { id: docRef.id, ...newAdjustmentData };
};
