
import React, { memo } from 'react';
// FIX: Changed react-router-dom import to use namespace import to fix module resolution issues.
import * as Router from 'react-router-dom';
import { ClientWithDebt } from '../../types/client.ts';
import { formatARS } from '../../utils/format.ts';

interface ClientTableProps {
  clients: ClientWithDebt[];
  onToggleActive: (id: string) => void;
}

const StatusPill: React.FC<{ active: boolean }> = ({ active }) => {
    const pillClasses = active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600';
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${pillClasses}`}>{active ? 'Activo' : 'Inactivo'}</span>;
};

export const ClientTable: React.FC<ClientTableProps> = memo(({ clients, onToggleActive }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
      <table className="w-full text-base text-left">
        <thead className="text-sm text-slate-600 uppercase bg-slate-100 font-semibold tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-4">Nombre</th>
            <th scope="col" className="px-6 py-4">Documento</th>
            <th scope="col" className="px-6 py-4">Cond. IVA</th>
            <th scope="col" className="px-6 py-4">Email</th>
            <th scope="col" className="px-6 py-4">Estado</th>
            <th scope="col" className="px-6 py-4 text-right">Deuda</th>
            <th scope="col" className="px-6 py-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="bg-white border-b hover:bg-slate-50">
              <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{client.name}</th>
              <td className="px-6 py-4 text-slate-700">{client.docType} {client.docNumber}</td>
              <td className="px-6 py-4 text-slate-700">{client.ivaCondition}</td>
              <td className="px-6 py-4 text-slate-700">{client.email}</td>
              <td className="px-6 py-4"><StatusPill active={client.active} /></td>
              <td className={`px-6 py-4 text-right font-semibold ${client.debt > 0 ? 'text-red-600' : 'text-slate-800'}`}>{formatARS(client.debt)}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-4">
                  <Router.Link to={`/clientes/${client.id}`} className="font-medium text-blue-600 hover:underline text-base">Ver Detalle</Router.Link>
                  <button onClick={() => onToggleActive(client.id)} className="font-medium text-slate-600 hover:underline text-base">{client.active ? 'Desactivar' : 'Activar'}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
