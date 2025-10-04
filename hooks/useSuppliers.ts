import { useState, useEffect, useMemo, useCallback } from 'react';
import { Supplier, SupplierWithDebt, SupplierImportRow, SupplierImportResult } from '../types/supplier';
import * as suppliersRepo from '../services/db/suppliersRepo';
import * as purchasesRepo from '../services/db/purchasesRepo';
import * as supplierPaymentsRepo from '../services/db/supplierPaymentsRepo';
import { useAuth } from '../context/AuthContext.tsx';
import { downloadBlob } from '../utils/storage.ts';

declare var XLSX: any;

type SortableKeys = 'businessName' | 'cuit' | 'createdAt' | 'debt';

export function useSuppliers() {
  const { currentUser } = useAuth();
  const [suppliers, setSuppliers] = useState<SupplierWithDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);
  const [sortBy, setSortBy] = useState<SortableKeys>('businessName');

  const fetchSuppliers = useCallback(async () => {
    if (!currentUser) {
      setSuppliers([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const userId = currentUser.uid;
      const [suppliersData, purchasesData, paymentsData] = await Promise.all([
        suppliersRepo.list(userId),
        purchasesRepo.list(userId),
        supplierPaymentsRepo.list(userId)
      ]);

      const debtBySupplier = new Map<string, number>();
      purchasesData.forEach(p => debtBySupplier.set(p.supplierId, (debtBySupplier.get(p.supplierId) || 0) + p.totalAmountARS));
      paymentsData.forEach(p => debtBySupplier.set(p.supplierId, (debtBySupplier.get(p.supplierId) || 0) - p.amountARS));

      const suppliersWithDebt = suppliersData.map(s => ({ ...s, debt: debtBySupplier.get(s.id) || 0 }));
      setSuppliers(suppliersWithDebt);
    } catch (err) {
      setError('No se pudieron cargar los proveedores.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleRepoAction = useCallback(async (action: (userId: string) => Promise<any>) => {
    if (!currentUser) throw new Error("User not authenticated.");
    try {
      setError(null);
      await action(currentUser.uid);
      await fetchSuppliers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setError(message);
      throw err;
    }
  }, [currentUser, fetchSuppliers]);

  const createSupplier = useCallback((data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => handleRepoAction((userId) => suppliersRepo.create(userId, data)), [handleRepoAction]);
  const updateSupplier = useCallback((id: string, data: Partial<Supplier>) => handleRepoAction((userId) => suppliersRepo.update(userId, id, data)), [handleRepoAction]);
  const deactivateSupplier = useCallback((id: string) => handleRepoAction((userId) => suppliersRepo.deactivate(userId, id)), [handleRepoAction]);
  const seedIfEmpty = useCallback(() => handleRepoAction(suppliersRepo.seedIfEmpty), [handleRepoAction]);

  const importSuppliers = useCallback(async (data: SupplierImportRow[]): Promise<SupplierImportResult> => {
      if (!currentUser) return { successCount: 0, errors: [] };
      const result = await suppliersRepo.batchCreate(currentUser.uid, data);
      if (result.successCount > 0) {
          await fetchSuppliers();
      }
      return result;
  }, [currentUser, fetchSuppliers]);

  const filteredAndSortedSuppliers = useMemo(() => {
    let result = [...suppliers];
    if (onlyActive) result = result.filter(s => s.active);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.businessName.toLowerCase().includes(q) || s.cuit.includes(q));
    }
    result.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA < valB) return (sortBy === 'createdAt' || sortBy === 'debt') ? 1 : -1;
      if (valA > valB) return (sortBy === 'createdAt' || sortBy === 'debt') ? -1 : 1;
      return 0;
    });
    return result;
  }, [suppliers, searchQuery, onlyActive, sortBy]);
  
  const exportSuppliers = useCallback((format: 'json' | 'csv' | 'excel', onlyFiltered: boolean = true) => {
    const dataToExport = onlyFiltered ? filteredAndSortedSuppliers : suppliers;

    if (format === 'json') {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        downloadBlob(blob, 'proveedores_export.json');
        return;
    }
    const flatData = dataToExport.map(s => {
        const { bank, ...rest } = s;
        return { ...rest, bankName: bank?.bankName, cbu: bank?.cbu, alias: bank?.alias };
    });

    if (format === 'excel') {
        if (typeof XLSX === 'undefined') return;
        const worksheet = XLSX.utils.json_to_sheet(flatData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");
        XLSX.writeFile(workbook, "proveedores_export.xlsx");
    } else if (format === 'csv') {
        if (!flatData.length) return;
        const headers = Object.keys(flatData[0]).join(',');
        const rows = flatData.map(s => 
            Object.values(s).map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = `${headers}\n${rows.join('\n')}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, 'proveedores_export.csv');
    }
  }, [suppliers, filteredAndSortedSuppliers]);

  return {
    suppliers: filteredAndSortedSuppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deactivateSupplier,
    importSuppliers,
    exportSuppliers,
    seedIfEmpty,
    searchQuery,
    setSearchQuery,
    onlyActive,
    setOnlyActive,
    sortBy,
    setSortBy,
  };
}
