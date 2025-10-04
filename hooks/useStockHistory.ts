import { useState, useEffect, useCallback } from 'react';
import { StockMovement } from '../types/history.ts';
import * as historyRepo from '../services/db/historyRepo.ts';
import { useAuth } from '../context/AuthContext.tsx';

export function useStockHistory() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!currentUser) {
        setHistory([]);
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await historyRepo.list(currentUser.uid);
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el historial.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    fetchHistory,
  };
}
