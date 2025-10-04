import React from 'react';
// FIX: Changed react-router-dom import to use namespace import to fix module resolution issues.
import * as Router from 'react-router-dom';
import { useStockHistory } from '../hooks/useStockHistory.ts';
import { formatDateTime } from '../utils/format.ts';
import { StockMovementType } from '../types/history.ts';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.tsx';
import { PageHeader } from '../components/shared/PageHeader.tsx';

// FIX: Add 'sale' to the map to cover all StockMovementType variants.
const MOVEMENT_TYPE_MAP: Record<StockMovementType, { label: string; color: string }> = {
    creation: { label: 'Creación', color: 'bg-blue-100 text-blue-800' },
    manual_adjustment: { label: 'Ajuste Manual', color: 'bg-indigo-100 text-indigo-800' },
    import: { label: 'Importación', color: 'bg-purple-100 text-purple-800' },
    deletion: { label: 'Eliminación', color: 'bg-red-100 text-red-800' },
    sale: { label: 'Venta', color: 'bg-green-100 text-green-800' },
};

const StockHistory: React.FC = () => {
    const { history, loading, error } = useStockHistory();

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <PageHeader 
                    title="Historial de Movimientos de Stock"
                    backTo="/stock"
                    backButtonText="Volver a Stock"
                />
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <PageHeader 
                    title="Historial de Movimientos de Stock"
                    backTo="/stock"
                    backButtonText="Volver a Stock"
                />
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <PageHeader 
                title="Historial de Movimientos de Stock"
                subtitle="Seguimiento detallado de todos los cambios en el inventario"
                backTo="/stock"
                backButtonText="Volver a Stock"
            />
            
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                            <th scope="col" className="px-6 py-3">Producto</th>
                            <th scope="col" className="px-6 py-3">Tipo de Movimiento</th>
                            <th scope="col" className="px-6 py-3 text-center">Cambio</th>
                            <th scope="col" className="px-6 py-3 text-center">Stock Resultante</th>
                            <th scope="col" className="px-6 py-3">Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500">
                                    No hay movimientos registrados en el historial.
                                </td>
                            </tr>
                        ) : (
                            history.map((movement) => (
                                <tr key={movement.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(movement.timestamp)}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900">
                                        <div>{movement.productName}</div>
                                        <div className="font-mono text-xs text-slate-400">{movement.productSku}</div>
                                    </th>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${MOVEMENT_TYPE_MAP[movement.type]?.color || 'bg-gray-100 text-gray-800'}`}>
                                            {MOVEMENT_TYPE_MAP[movement.type]?.label || movement.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-center font-semibold ${movement.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {movement.change > 0 ? `+${movement.change}` : movement.change}
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-slate-800">{movement.newStock}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{movement.notes}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockHistory;