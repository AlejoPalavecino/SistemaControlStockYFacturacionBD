import { db } from '../firebaseConfig.ts';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, getDoc } from "firebase/firestore";

const DEFAULT_CATEGORIES = ['Librería', 'Papelería', 'Escolar', 'Tecnología', 'General'];
const METADATA_DOC_ID = 'metadata';
const CATEGORIES_COLLECTION_ID = 'categories';

const getCategoriesCollection = (userId: string) => collection(db, 'users', userId, CATEGORIES_COLLECTION_ID);

const seedDefaultCategories = async (userId: string) => {
    const batch = writeBatch(db);
    const categoriesRef = getCategoriesCollection(userId);
    DEFAULT_CATEGORIES.forEach(name => {
        const docRef = doc(categoriesRef); // Create a new doc with a random ID
        batch.set(docRef, { name });
    });
    await batch.commit();
    return DEFAULT_CATEGORIES;
};

// --- Public API ---

export const list = async (userId: string): Promise<string[]> => {
    const categoriesRef = getCategoriesCollection(userId);
    const querySnapshot = await getDocs(categoriesRef);
    if (querySnapshot.empty) {
        return await seedDefaultCategories(userId);
    }
    return querySnapshot.docs.map(doc => doc.data().name).sort((a,b) => a.localeCompare(b));
};

export const create = async (userId: string, name: string): Promise<string> => {
    const trimmedName = name.trim();
    if (!trimmedName) {
        throw new Error("El nombre de la categoría no puede estar vacío.");
    }

    const categoriesRef = getCategoriesCollection(userId);
    const q = query(categoriesRef, where("name", "==", trimmedName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
         throw new Error(`La categoría "${trimmedName}" ya existe.`);
    }

    await addDoc(categoriesRef, { name: trimmedName });
    return trimmedName;
};

export const update = async (userId: string, oldName: string, newName: string): Promise<string> => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName) {
        throw new Error("El nuevo nombre de la categoría no puede estar vacío.");
    }

    const categoriesRef = getCategoriesCollection(userId);
    
    // Check if new name already exists
    const newNameQuery = query(categoriesRef, where("name", "==", trimmedNewName));
    const newNameSnapshot = await getDocs(newNameQuery);
    if (!newNameSnapshot.empty) {
        throw new Error(`La categoría "${trimmedNewName}" ya existe.`);
    }

    // Find the document with the old name
    const oldNameQuery = query(categoriesRef, where("name", "==", oldName));
    const oldNameSnapshot = await getDocs(oldNameQuery);

    if (oldNameSnapshot.empty) {
        throw new Error(`La categoría "${oldName}" no fue encontrada.`);
    }
    
    const docToUpdate = oldNameSnapshot.docs[0];
    await updateDoc(docToUpdate.ref, { name: trimmedNewName });

    return trimmedNewName;
};

export const remove = async (userId: string, name: string): Promise<void> => {
    const categoriesRef = getCategoriesCollection(userId);
    const q = query(categoriesRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error(`La categoría "${name}" no fue encontrada.`);
    }
    
    const docToDelete = querySnapshot.docs[0];
    await deleteDoc(docToDelete.ref);
};
