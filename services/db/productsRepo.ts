import { Product, ProductId, Category, ProductImportResult } from '../../types/product.ts';
import { generarSKU } from '../../utils/sku.ts';
import * as categoriesRepo from './categoriesRepo';
import * as historyRepo from './historyRepo';
import { StockMovementType } from '../../types/history.ts';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, query, where } from "firebase/firestore";

const getProductsCollection = (userId: string) => collection(db, 'users', userId, 'products');

// --- Public API ---

export const list = async (userId: string): Promise<Product[]> => {
    const querySnapshot = await getDocs(getProductsCollection(userId));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getById = async (userId: string, id: ProductId): Promise<Product | null> => {
    const docRef = doc(db, 'users', userId, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
};

export const create = async (
    userId: string,
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sku'> & { sku?: string }
): Promise<Product> => {
    if (!data.name) throw new Error("Product name is required.");
    const validCategories = await categoriesRepo.list(userId);
    if (!validCategories.includes(data.category)) {
        await categoriesRepo.create(userId, data.category);
    }
    
    let sku = data.sku || generarSKU(data.name, data.category);
    const productsRef = getProductsCollection(userId);
    let skuExists = (await getDocs(query(productsRef, where("sku", "==", sku)))).docs.length > 0;
    while (skuExists) {
        sku = generarSKU(data.name, data.category, true); // force retry
        skuExists = (await getDocs(query(productsRef, where("sku", "==", sku)))).docs.length > 0;
    }

    const newProductData = {
        ...data,
        sku,
        priceARS: Math.max(0, data.priceARS),
        stock: Math.max(0, data.stock),
        minStock: Math.max(0, data.minStock),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(productsRef, newProductData);

    await historyRepo.add(userId, {
        productId: docRef.id,
        productSku: sku,
        productName: data.name,
        type: 'creation',
        change: newProductData.stock,
        newStock: newProductData.stock,
        notes: 'Producto creado.'
    });

    return { id: docRef.id, ...newProductData };
};

export const update = async (userId: string, id: ProductId, patch: Partial<Omit<Product, 'id'>>): Promise<Product> => {
    const productRef = doc(db, 'users', userId, 'products', id);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) throw new Error(`Product with id ${id} not found`);

    const oldProduct = productSnap.data() as Product;
    const oldStock = oldProduct.stock;
    
    if (patch.category) {
        const validCategories = await categoriesRepo.list(userId);
        if (!validCategories.includes(patch.category)) {
             await categoriesRepo.create(userId, patch.category);
        }
    }

    const updateData = {
        ...patch,
        updatedAt: new Date().toISOString(),
    };

    await updateDoc(productRef, updateData);

    const updatedProduct = { ...oldProduct, ...updateData, id };

    if (patch.stock !== undefined && patch.stock !== oldStock) {
        await historyRepo.add(userId, {
            productId: updatedProduct.id,
            productSku: updatedProduct.sku,
            productName: updatedProduct.name,
            type: 'manual_adjustment',
            change: updatedProduct.stock - oldStock,
            newStock: updatedProduct.stock,
            notes: 'Ajuste manual de stock.'
        });
    }
    
    return updatedProduct;
};

export const remove = async (userId: string, id: ProductId): Promise<void> => {
    const productRef = doc(db, 'users', userId, 'products', id);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) throw new Error(`Product with id ${id} not found`);
    const productToDelete = productSnap.data() as Product;
    
    await deleteDoc(productRef);

    await historyRepo.add(userId, {
        productId: id,
        productSku: productToDelete.sku,
        productName: productToDelete.name,
        type: 'deletion',
        change: -productToDelete.stock,
        newStock: 0,
        notes: 'Producto eliminado.'
    });
};

export const adjustStock = async (userId: string, id: ProductId, delta: number, type: StockMovementType, notes: string): Promise<Product> => {
    const productRef = doc(db, 'users', userId, 'products', id);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) throw new Error(`Product with id ${id} not found`);
    
    const product = productSnap.data() as Product;
    const oldStock = product.stock;
    const newStock = oldStock + delta;

    if (newStock < 0) {
        throw new Error(`Stock insuficiente para ${product.name}. Stock actual: ${oldStock}, se necesita: ${-delta}`);
    }

    await updateDoc(productRef, { stock: newStock, updatedAt: new Date().toISOString() });
    
    const updatedProduct = { ...product, id, stock: newStock };
    
    await historyRepo.add(userId, {
        productId: updatedProduct.id,
        productSku: updatedProduct.sku,
        productName: updatedProduct.name,
        type: type,
        change: delta,
        newStock: updatedProduct.stock,
        notes: notes,
    });

    return updatedProduct;
};


export const batchCreate = async (userId: string, data: any[]): Promise<ProductImportResult> => {
    const results: ProductImportResult = {
        successCount: 0,
        errors: [],
    };
    const validCategories = await categoriesRepo.list(userId);

    for (const item of data) {
        if (!item || typeof item !== 'object') {
            results.errors.push({ item, reason: 'El registro no es un objeto válido.' });
            continue;
        }

        const normalizedItem: any = {};
        for (const key in item) {
            normalizedItem[key.toLowerCase()] = item[key];
        }

        const { name, category, pricears: priceARS, stock, minstock: minStock, sku, active } = normalizedItem;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            results.errors.push({ item, reason: 'El campo "name" es obligatorio.' });
            continue;
        }
        if (!category || typeof category !== 'string') {
            results.errors.push({ item, reason: 'El campo "category" es obligatorio.' });
            continue;
        }
        
        try {
            const productData = {
                name: name.trim(),
                category: category as Category,
                priceARS: Number(priceARS) || 0,
                stock: Number(stock) || 0,
                minStock: Number(minStock) || 0,
                sku: (sku && typeof sku === 'string') ? sku : undefined,
                active: typeof active === 'boolean' ? active : true,
            };

            await create(userId, productData);
            results.successCount++;
        } catch (error) {
            const reason = error instanceof Error ? error.message : 'Error desconocido.';
            results.errors.push({ item, reason });
        }
    }
    
    return results;
};


export const isCategoryInUse = async (userId: string, categoryName: Category): Promise<boolean> => {
    const q = query(getProductsCollection(userId), where("category", "==", categoryName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};

export const updateCategoryName = async (userId: string, oldName: Category, newName: Category): Promise<void> => {
    const q = query(getProductsCollection(userId), where("category", "==", oldName));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach(docSnap => {
        batch.update(docSnap.ref, { category: newName });
    });
    await batch.commit();
};