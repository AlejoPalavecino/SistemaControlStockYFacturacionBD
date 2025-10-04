import React from 'react';
import { Product } from '../../types/product';
import { formatARS } from '../../utils/format';
import Logo from '../Logo.tsx';

export interface QuickSaleItem extends Product {
    qty: number;
}

interface QuickSaleReceiptProps {
  items: QuickSaleItem[];
  total: number;
}

export const QuickSaleReceipt: React.FC<QuickSaleReceiptProps> = ({ items, total }) => {
  return (
    // Using a fixed width similar to a thermal printer receipt (e.g., 80mm -> ~300px)
    // and font-mono for a classic receipt look. max-w-full ensures it shrinks on small screens.
    <div className="p-4 bg-white text-black font-mono max-w-full w-72">
      {/* Header with Company Info */}
      <div className="text-center mb-4">
        <div className="flex justify-center mb-2">
          <Logo size="sm" showText={true} />
        </div>
        <h2 className="text-lg font-bold">Clip Librería</h2>
        <p className="text-xs">Calle Falsa 123, CABA</p>
        <p className="text-xs">IVA Responsable Inscripto</p>
      </div>

      {/* Title and Date */}
      <div className="text-center border-t border-b border-dashed border-black py-2">
        <h1 className="text-xl font-bold">Comprobante de Venta</h1>
        <p className="text-sm mt-1">{new Date().toLocaleString('es-AR')}</p>
      </div>
      
      {/* Items Section */}
      <div className="my-4 space-y-2">
        {items.map(item => (
          <div key={item.id} className="text-xs">
            <p className="font-semibold">{item.name}</p>
            <div className="flex justify-between">
              <span>{`${item.qty} x ${formatARS(item.priceARS)}`}</span>
              <span className="font-medium">{formatARS(item.priceARS * item.qty)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="mt-4 border-t-2 border-black pt-2">
        <div className="flex justify-between items-center text-xl">
          <span className="font-bold">TOTAL:</span>
          <span className="font-bold">{formatARS(total)}</span>
        </div>
      </div>
    </div>
  );
};