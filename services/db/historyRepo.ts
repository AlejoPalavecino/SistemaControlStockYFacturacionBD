import { StockMovement } from '../../types/history.ts';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, addDoc } from "firebase/firestore";

const getHistoryCollection = (userId: string) => collection(db, 'users', userId, 'stock_history');

// --- Public API ---

export const list = async (userId: string): Promise<StockMovement[]> => {
    const querySnapshot = await getDocs(getHistoryCollection(userId));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement));
};

export const add = async (userId: string, movementData: Omit<StockMovement, 'id' | 'timestamp'>): Promise<StockMovement> => {
    const newMovementData = {
        timestamp: new Date().toISOString(),
        ...movementData,
    };
    const docRef = await addDoc(getHistoryCollection(userId), newMovementData);
    return { id: docRef.id, ...newMovementData };
};
