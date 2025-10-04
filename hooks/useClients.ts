import { useState, useEffect, useMemo, useCallback } from 'react';
import { Client, ClientImportRow, ClientImportResult, ClientWithDebt } from '../types/client.ts';
import * as clientsRepo from '../services/db/clientsRepo.ts';
import * as invoicesRepo from '../services/db/invoicesRepo.ts';
import * as paymentsRepo from '../services/db/paymentsRepo.ts';
import * as adjustmentsRepo from '../services/db/adjustmentsRepo.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { downloadBlob } from '../utils/storage.ts';

declare var XLSX: any;

type SortableKeys = 'name' | 'docNumber' | 'createdAt' | 'debt';

export function useClients() {
  const { currentUser } = useAuth();
  const [clientsWithDebt, setClientsWithDebt] = useState<ClientWithDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);
  const [sortBy, setSortBy] = useState<SortableKeys>('name');
  
  const fetchClients = useCallback(async () => {
    if (!currentUser) {
        setClientsWithDebt([]);
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      const userId = currentUser.uid;
      const [clientsData, invoicesData, paymentsData, adjustmentsData] = await Promise.all([
          clientsRepo.list(userId),
          invoicesRepo.list(userId),
          paymentsRepo.list(userId),
          adjustmentsRepo.list(userId)
      ]);
      
      const paymentsByClient = new Map<string, number>();
      paymentsData.forEach(p => paymentsByClient.set(p.clientId, (paymentsByClient.get(p.clientId) || 0) + p.amountARS));

      const debtByClient = new Map<string, number>();
      invoicesData.forEach(inv => {
          if (inv.status === 'EMITIDA') {
            debtByClient.set(inv.clientId, (debtByClient.get(inv.clientId) || 0) + inv.totals.totalARS);
          }
      });
      
      const adjustmentsByClient = new Map<string, number>();
      adjustmentsData.forEach(adj => {
          const amount = adj.type === 'DEBIT' ? adj.amountARS : -adj.amountARS;
          adjustmentsByClient.set(adj.clientId, (adjustmentsByClient.get(adj.clientId) || 0) + amount);
      });

      const clientsWithDebtData = clientsData.map(client => {
          const totalInvoiced = debtByClient.get(client.id) || 0;
          const totalPaid = paymentsByClient.get(client.id) || 0;
          const totalAdjustments = adjustmentsByClient.get(client.id) || 0;
          return { ...client, debt: totalInvoiced - totalPaid + totalAdjustments };
      });

      setClientsWithDebt(clientsWithDebtData);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los clientes.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  const handleRepoAction = useCallback(async (action: (userId: string) => Promise<any>) => {
      if (!currentUser) throw new Error("User not authenticated.");
      try {
          setError(null);
          await action(currentUser.uid);
          await fetchClients();
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
          throw err;
      }
  }, [currentUser, fetchClients]);

  const createClient = useCallback((data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => 
    handleRepoAction((userId) => clientsRepo.create(userId, data)), 
  [handleRepoAction]);

  const updateClient = useCallback((id: string, data: Partial<Client>) => 
    handleRepoAction((userId) => clientsRepo.update(userId, id, data)), 
  [handleRepoAction]);
  
  const deactivateClient = useCallback((id: string) => 
    handleRepoAction((userId) => clientsRepo.deactivate(userId, id)), 
  [handleRepoAction]);
  
  const seedIfEmpty = useCallback(() => 
    handleRepoAction(clientsRepo.seedIfEmpty), 
  [handleRepoAction]);
  
  const importClients = useCallback(async (data: ClientImportRow[]): Promise<ClientImportResult> => {
      if (!currentUser) return { successCount: 0, errors: [] };
      const result = await clientsRepo.batchCreate(currentUser.uid, data);
      if (result.successCount > 0) {
          await fetchClients();
      }
      return result;
  }, [currentUser, fetchClients]);

  const filteredAndSortedClients = useMemo(() => {
    let result = [...clientsWithDebt];

    if (onlyActive) {
      result = result.filter(c => c.active);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) || c.docNumber.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA < valB) return (sortBy === 'createdAt' || sortBy === 'debt') ? 1 : -1;
      if (valA > valB) return (sortBy === 'createdAt' || sortBy === 'debt') ? -1 : 1;
      return 0;
    });

    return result;
  }, [clientsWithDebt, searchQuery, onlyActive, sortBy]);

  const exportClients = useCallback((format: 'json' | 'csv' | 'excel', onlyFiltered: boolean = true) => {
    const dataToExport = onlyFiltered ? filteredAndSortedClients : clientsWithDebt;
    const clientsOnly = dataToExport.map(({debt, ...client}) => client);
    
    if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(clientsOnly);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
        XLSX.writeFile(workbook, "clientes_export.xlsx");
        return;
    }
    
    let blob: Blob;
    if (format === 'json') {
        blob = new Blob([JSON.stringify(clientsOnly, null, 2)], { type: 'application/json' });
    } else { 
        const headers = Object.keys(clientsOnly[0] || {}).join(',');
        const rows = clientsOnly.map(client => 
            Object.values(client).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = `${headers}\n${rows.join('\n')}`;
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }

    downloadBlob(blob, `clientes_export.${format}`);
  }, [clientsWithDebt, filteredAndSortedClients]);

  return {
    clients: filteredAndSortedClients,
    loading,
    error,
    createClient,
    updateClient,
    deactivateClient,
    seedIfEmpty,
    importClients,
    exportClients,
    searchQuery,
    setSearchQuery,
    onlyActive,
    setOnlyActive,
    sortBy,
    setSortBy,
  };
}
