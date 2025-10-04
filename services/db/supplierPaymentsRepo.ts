import { SupplierPayment } from '../../types/supplierPayment.ts';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

const getPaymentsCollection = (userId: string) => collection(db, 'users', userId, 'supplier_payments');

export const list = async (userId: string): Promise<SupplierPayment[]> => {
    const querySnapshot = await getDocs(getPaymentsCollection(userId));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupplierPayment));
};

export const listBySupplier = async (userId: string, supplierId: string): Promise<SupplierPayment[]> => {
    const q = query(getPaymentsCollection(userId), where("supplierId", "==", supplierId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupplierPayment));
};

export const create = async (userId: string, data: Omit<SupplierPayment, 'id' | 'createdAt'>): Promise<SupplierPayment> => {
    if (data.amountARS <= 0) throw new Error("El monto del pago debe ser positivo.");
    
    const newPaymentData = {
        ...data,
        createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(getPaymentsCollection(userId), newPaymentData);
    return { id: docRef.id, ...newPaymentData };
};