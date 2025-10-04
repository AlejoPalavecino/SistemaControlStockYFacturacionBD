
import React, { useState, useMemo, memo, useCallback } from 'react';
import { Invoice, InvoiceStatus } from '../../types/invoice';
import { formatARS } from '../../utils/format';
import { useDebounce } from '../../hooks/usePerformance.ts';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onCancel: (id: string) => void;
}

const StatusPill: React.FC<{ status: InvoiceStatus }> = memo(({ status }) => {
    const styles = {
        BORRADOR: 'bg-yellow-100 text-yellow-800',
        EMITIDA: 'bg-green-100 text-green-800',
        ANULADA: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
            {status}
        </span>
    );
});

// Limitar la cantidad de resultados mostrados para mejorar rendimiento
const MAX_VISIBLE_INVOICES = 50;

export const InvoiceList: React.FC<InvoiceListProps> = memo(({ invoices, onEdit, onView, onCancel }) => {
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [internalSearchQuery, setInternalSearchQuery] = useState('');

    // Debounce la búsqueda para evitar renders innecesarios
    const debouncedSearch = useDebounce((query: string) => {
        setSearchQuery(query);
    }, 300);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInternalSearchQuery(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    const filteredInvoices = useMemo(() => {
        let filtered = invoices;
        
        // Aplicar filtros
        if (statusFilter) {
            filtered = filtered.filter(inv => inv.status === statusFilter);
        }
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(inv => 
                inv.clientName.toLowerCase().includes(q) || 
                `${inv.pos}-${inv.number}`.includes(q)
            );
        }
        
        // Ordenar por fecha (más recientes primero)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Limitar resultados para mejorar rendimiento
        return filtered.slice(0, MAX_VISIBLE_INVOICES);
    }, [invoices, statusFilter, searchQuery]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Historial de Facturas</h3>
                {filteredInvoices.length === MAX_VISIBLE_INVOICES && (
                    <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                        Mostrando las {MAX_VISIBLE_INVOICES} más recientes
                    </span>
                )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input 
                    type="text" 
                    placeholder="Buscar por cliente o número..."
                    value={internalSearchQuery}
                    onChange={handleSearchChange}
                    className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg placeholder-slate-600 focus:ring-blue-500 focus:border-blue-500 flex-grow"
                />
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 md:w-auto"
                    aria-label="Filtrar por estado de factura"
                >
                    <option value="">Todos los estados</option>
                    <option value="BORRADOR">Borrador</option>
                    <option value="EMITIDA">Emitida</option>
                    <option value="ANULADA">Anulada</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="text-left text-sm font-semibold text-slate-600 uppercase bg-slate-100">
                        <tr>
                            <th className="px-4 py-3">Número</th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                         {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500 text-base">
                                    No se encontraron facturas.
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50 text-base">
                                    <td className="px-4 py-3 font-mono text-slate-700">{inv.pos}-{inv.number}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{inv.clientName}</td>
                                    <td className="px-4 py-3 text-slate-600">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3"><StatusPill status={inv.status} /></td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatARS(inv.totals.totalARS)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-3">
                                            {inv.status === 'BORRADOR' && (
                                                <button onClick={() => onEdit(inv.id)} className="font-medium text-blue-600 hover:underline text-base">Editar</button>
                                            )}
                                            {inv.status === 'EMITIDA' && (
                                                <>
                                                    <button onClick={() => onView(inv.id)} className="font-medium text-blue-600 hover:underline text-base">Ver</button>
                                                    <button onClick={() => onCancel(inv.id)} className="font-medium text-red-600 hover:underline text-base">Anular</button>
                                                </>
                                            )}
                                            {inv.status === 'ANULADA' && (
                                                <button onClick={() => onView(inv.id)} className="font-medium text-slate-600 hover:underline text-base">Ver</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});