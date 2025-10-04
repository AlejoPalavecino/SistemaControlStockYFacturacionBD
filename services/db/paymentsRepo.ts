import { Payment } from '../../types/payment.ts';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

const getPaymentsCollection = (userId: string) => collection(db, 'users', userId, 'payments');

export const list = async (userId: string): Promise<Payment[]> => {
    const querySnapshot = await getDocs(getPaymentsCollection(userId));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
};

export const listByClient = async (userId: string, clientId: string): Promise<Payment[]> => {
    const q = query(getPaymentsCollection(userId), where("clientId", "==", clientId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
};

export const create = async (userId: string, data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
    if (data.amountARS <= 0) throw new Error("El monto del pago debe ser positivo.");
    
    const newPaymentData = {
        ...data,
        createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(getPaymentsCollection(userId), newPaymentData);
    return { id: docRef.id, ...newPaymentData };
};