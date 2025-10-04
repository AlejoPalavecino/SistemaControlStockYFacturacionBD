import { useState, useEffect, useCallback, useMemo } from 'react';
import * as categoriesRepo from '../services/db/categoriesRepo.ts';
import * as productsRepo from '../services/db/productsRepo.ts';
import { useAuth } from '../context/AuthContext.tsx';

export function useCategories() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!currentUser) {
        setCategories([]);
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesRepo.list(currentUser.uid);
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las categorías.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (name: string) => {
    if (!currentUser) return;
    try {
      setError(null);
      await categoriesRepo.create(currentUser.uid, name);
      await fetchCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : `No se pudo añadir la categoría.`;
      setError(message);
      throw err;
    }
  }, [currentUser, fetchCategories]);

  const updateCategory = useCallback(async (oldName: string, newName: string) => {
    if (!currentUser || oldName === newName) return;
    try {
      setError(null);
      await categoriesRepo.update(currentUser.uid, oldName, newName);
      await productsRepo.updateCategoryName(currentUser.uid, oldName, newName);
      await fetchCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : `No se pudo actualizar la categoría.`;
      setError(message);
      throw err;
    }
  }, [currentUser, fetchCategories]);

  const deleteCategory = useCallback(async (name: string) => {
    if (!currentUser) return;
    try {
      setError(null);
      const isInUse = await productsRepo.isCategoryInUse(currentUser.uid, name);
      if (isInUse) {
        throw new Error(`La categoría "${name}" está en uso y no se puede eliminar.`);
      }
      await categoriesRepo.remove(currentUser.uid, name);
      await fetchCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : `No se pudo eliminar la categoría.`;
      setError(message);
      throw err;
    }
  }, [currentUser, fetchCategories]);

  const memoizedResult = useMemo(() => ({
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  }), [categories, loading, error, addCategory, updateCategory, deleteCategory]);

  return memoizedResult;
}
