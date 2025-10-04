import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductId, Category, ProductImportResult } from '../types/product.ts';
import * as productsRepo from '../services/db/productsRepo.ts';
import { useAuth } from '../context/AuthContext.tsx';

const DEMO_PRODUCTS: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sku'>[] = [
    { name: 'Lápiz HB #2', category: 'Librería', priceARS: 150.50, stock: 120, minStock: 20, active: true },
    { name: 'Cuaderno A4 Rayado', category: 'Papelería', priceARS: 850.00, stock: 80, minStock: 15, active: true },
    { name: 'Resma de Papel A4 75g', category: 'Papelería', priceARS: 4500.00, stock: 15, minStock: 10, active: true },
    { name: 'Mochila Escolar', category: 'Escolar', priceARS: 12500.00, stock: 8, minStock: 5, active: true },
    { name: 'Pendrive 64GB', category: 'Tecnología', priceARS: 7800.00, stock: 25, minStock: 5, active: true },
    { name: 'Tijera Escolar', category: 'Librería', priceARS: 450.00, stock: 50, minStock: 10, active: true },
    { name: 'Calculadora Científica', category: 'Tecnología', priceARS: 9900.00, stock: 12, minStock: 3, active: false },
    { name: 'Cinta Adhesiva', category: 'General', priceARS: 300.00, stock: 100, minStock: 25, active: true },
];

type SortableKeys = 'name' | 'sku' | 'stock' | 'priceARS';

declare var XLSX: any;

export function useProducts() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [sortedBy, setSortedBy] = useState<SortableKeys>('name');
  
  const fetchProducts = useCallback(async () => {
    if (!currentUser) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await productsRepo.list(currentUser.uid);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los productos.');
      // Error logged internally
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;
    await productsRepo.create(currentUser.uid, data);
    await fetchProducts();
  }, [currentUser, fetchProducts]);

  const updateProduct = useCallback(async (id: ProductId, data: Partial<Product>) => {
    if (!currentUser) return;
    await productsRepo.update(currentUser.uid, id, data);
    await fetchProducts();
  }, [currentUser, fetchProducts]);
  
  const removeProduct = useCallback(async (id: ProductId) => {
    if (!currentUser) return;
    await productsRepo.remove(currentUser.uid, id);
    await fetchProducts();
  }, [currentUser, fetchProducts]);

  const importProducts = useCallback(async (data: any[]): Promise<ProductImportResult> => {
    if (!currentUser) return { successCount: 0, errors: [{ item: 'General', reason: 'No user logged in'}]};
    const result = await productsRepo.batchCreate(currentUser.uid, data);
    if (result.successCount > 0) {
        await fetchProducts();
    }
    return result;
  }, [currentUser, fetchProducts]);
  
  const seedIfEmpty = useCallback(async () => {
    if (!currentUser) return;
    const currentProducts = await productsRepo.list(currentUser.uid);
    if (currentProducts.length === 0) {
        setLoading(true);
        try {
            for (const p of DEMO_PRODUCTS) {
                await productsRepo.create(currentUser.uid, p);
            }
            await fetchProducts();
        } catch (err) {
            setError('No se pudieron cargar los datos de prueba.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
  }, [currentUser, fetchProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }

    if (showOnlyLowStock) {
      result = result.filter(p => p.stock < p.minStock);
    }

    result.sort((a, b) => {
      if (a[sortedBy] < b[sortedBy]) return -1;
      if (a[sortedBy] > b[sortedBy]) return 1;
      return 0;
    });

    return result;
  }, [products, searchQuery, categoryFilter, showOnlyLowStock, sortedBy]);
  
  const exportProducts = useCallback((format: 'excel') => {
    if (format !== 'excel' || typeof XLSX === 'undefined') {
        console.error("XLSX library not loaded or format not supported.");
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "products_export.xlsx");
  }, [products]);

  return {
    products: filteredAndSortedProducts,
    loading,
    error,
    createProduct,
    updateProduct,
    removeProduct,
    seedIfEmpty,
    importProducts,
    exportProducts,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    showOnlyLowStock,
    setShowOnlyLowStock,
    sortedBy,
    setSortedBy,
  };
}
