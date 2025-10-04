
import React from 'react';
import { formatARS } from '../../utils/format';

export type HistoryType = 'FACTURA' | 'PAGO' | 'AJUSTE';

export interface ClientHistoryItem {
  type: HistoryType;
  date: string; // ISO
  amountARS?: number;
  note?: string;
  data?: {
    id?: string | number;
    description?: string;
  };
}

interface ClientHistoryTableProps {
  history: ClientHistoryItem[];
  emptyMessage?: string;
}

export default function ClientHistoryTable({
  history,
  emptyMessage = 'Sin movimientos registrados',
}: ClientHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base text-left text-slate-500">
        <thead className="text-sm font-semibold text-slate-600 uppercase bg-slate-100">
          <tr>
            <th scope="col" className="px-6 py-4">Tipo</th>
            <th scope="col" className="px-6 py-4">Fecha</th>
            <th scope="col" className="px-6 py-4">Descripción</th>
            <th scope="col" className="px-6 py-4 text-right">Importe</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {history.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-10 text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            history.map((item, index) => (
              <tr key={`${item.type}-${item.data?.id ?? index}`} className="bg-white hover:bg-slate-50">
                <td className="px-6 py-4">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(item.date).toLocaleDateString('es-AR')}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{item.data?.description ?? item.note ?? '—'}</td>
                <td className="px-6 py-4 text-right font-semibold text-slate-900">
                  {formatARS(Number.isFinite(item.amountARS) ? (item.amountARS as number) : 0)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
