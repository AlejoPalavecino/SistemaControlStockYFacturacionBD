
import React, { memo } from 'react';
import { InvoiceItem, IvaRate } from '../../types/invoice.ts';
import { formatARS } from '../../utils/format.ts';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onUpdate: (index: number, item: InvoiceItem) => void;
  onRemove: (index: number) => void;
  isEditable: boolean;
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = memo(({ items, onUpdate, onRemove, isEditable }) => {
    
    const handleQtyChange = (index: number, newQty: number) => {
        const item = items[index];
        const qty = Math.max(1, newQty);
        const updatedItem = { ...item, qty, lineTotalARS: item.unitPriceARS * qty };
        onUpdate(index, updatedItem);
    };
    
    const handlePriceChange = (index: number, newPrice: number) => {
        const item = items[index];
        const price = Math.max(0, newPrice);
        const updatedItem = { ...item, unitPriceARS: price, lineTotalARS: price * item.qty };
        onUpdate(index, updatedItem);
    };

    const handleTaxRateChange = (index: number, newTaxRate: IvaRate) => {
        const item = items[index];
        const updatedItem = { ...item, taxRate: newTaxRate };
        onUpdate(index, updatedItem);
    };


    return (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-left text-sm font-semibold text-slate-600 uppercase">
                    <tr>
                        <th className="px-4 py-2">SKU</th>
                        <th className="px-4 py-2">Producto</th>
                        <th className="px-4 py-2 text-center">Cantidad</th>
                        <th className="px-4 py-2 text-right">P. Unitario</th>
                        <th className="px-4 py-2 text-center">IVA (%)</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        {isEditable && <th className="px-4 py-2"></th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={isEditable ? 7 : 6} className="text-center py-8 text-slate-500">
                                No hay ítems en la factura.
                            </td>
                        </tr>
                    )}
                    {items.map((item, index) => (
                        <tr key={item.productId + index} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-mono text-xs text-slate-500">{item.sku}</td>
                            <td className="px-4 py-2 font-medium text-slate-800">{item.name}</td>
                            <td className="px-4 py-2 w-28">
                                {isEditable ? (
                                    <input 
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 1)}
                                        className="block w-full px-3 py-2 text-base text-center text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        min="1"
                                    />
                                ) : (
                                    <div className="text-center">{item.qty}</div>
                                )}
                            </td>
                            <td className="px-4 py-2 text-right w-36">
                                {isEditable ? (
                                    <input 
                                        type="number"
                                        value={item.unitPriceARS}
                                        onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                                        className="block w-full px-3 py-2 text-base text-right text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        min="0"
                                        step="0.01"
                                    />
                                ) : (
                                    formatARS(item.unitPriceARS)
                                )}
                            </td>
                            <td className="px-4 py-2 w-28">
                                {isEditable ? (
                                     <select 
                                        value={item.taxRate} 
                                        onChange={(e) => handleTaxRateChange(index, parseFloat(e.target.value) as IvaRate)}
                                        className="block w-full px-3 py-2 text-base text-center text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={21}>21%</option>
                                        <option value={10.5}>10.5%</option>
                                        <option value={0}>0%</option>
                                     </select>
                                ) : (
                                    <div className="text-center">{item.taxRate}%</div>
                                )}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-slate-900">{formatARS(item.lineTotalARS)}</td>
                            {isEditable && (
                                <td className="px-4 py-2 text-center">
                                    <button onClick={() => onRemove(index)} className="p-1 text-slate-400 hover:text-red-600 rounded-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});
