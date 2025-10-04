import { db } from '../firebaseConfig.ts';
import { doc, runTransaction, getDoc } from "firebase/firestore";

const formatNumber = (num: number): string => num.toString().padStart(8, '0');

const getCounterDocRef = (userId: string) => doc(db, 'users', userId, 'metadata', 'invoiceCounters');

export const getNextInvoiceNumber = async (userId: string, pos: string): Promise<string> => {
    try {
        const counterDocRef = getCounterDocRef(userId);
        const docSnap = await getDoc(counterDocRef);
        const lastNumber = docSnap.exists() ? (docSnap.data()[pos] || 0) : 0;
        return formatNumber(lastNumber + 1);
    } catch (e) {
        console.error("Failed to get next invoice number", e);
        return formatNumber(1);
    }
};

export const incrementInvoiceNumber = async (userId: string, pos: string): Promise<string> => {
    const counterDocRef = getCounterDocRef(userId);
    let newNumber = 1;

    try {
        await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterDocRef);
            const currentNumber = counterDoc.exists() ? (counterDoc.data()[pos] || 0) : 0;
            newNumber = currentNumber + 1;
            
            transaction.set(counterDocRef, { [pos]: newNumber }, { merge: true });
        });
        return formatNumber(newNumber);
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw new Error("Failed to generate new invoice number.");
    }
};
