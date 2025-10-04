
import React from 'react';
import { formatARS, formatDateTime } from '../../utils/format';
import { SupplierHistoryItem } from '../../hooks/useSupplierDetails';

interface SupplierHistoryTableProps {
    history: SupplierHistoryItem[];
}

export const SupplierHistoryTable: React.FC<SupplierHistoryTableProps> = ({ history }) => {
    
    const renderDescription = (item: SupplierHistoryItem) => {
        switch (item.type) {
            case 'PURCHASE':
                return `Compra - ${item.data.notes || 'Sin descripción'}`;
            case 'PAYMENT':
                return `Pago realizado (${item.data.paymentMethod})`;
            default:
                return 'Movimiento desconocido';
        }
    };

    const renderDebit = (item: SupplierHistoryItem) => {
        if (item.type === 'PURCHASE') {
            return formatARS(item.data.totalAmountARS);
        }
        return '-';
    };

    const renderCredit = (item: SupplierHistoryItem) => {
        if (item.type === 'PAYMENT') {
            return formatARS(item.data.amountARS);
        }
        return '-';
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-500">
                <thead className="text-sm font-semibold text-slate-600 uppercase bg-slate-100">
                    <tr>
                        <th scope="col" className="px-6 py-4">Fecha</th>
                        <th scope="col" className="px-6 py-4">Descripción</th>
                        <th scope="col" className="px-6 py-4 text-right">Debe (Pagos)</th>
                        <th scope="col" className="px-6 py-4 text-right">Haber (Compras)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {history.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-10 text-slate-500 text-base">
                                No hay movimientos para este proveedor.
                            </td>
                        </tr>
                    ) : (
                        history.map((item, index) => (
                            <tr key={`${item.type}-${item.data.id}-${index}`} className="bg-white hover:bg-slate-50 text-base">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(item.date).toLocaleDateString('es-AR')}</td>
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {renderDescription(item)}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-green-600">
                                    {renderCredit(item)}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-red-600">
                                    {renderDebit(item)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
