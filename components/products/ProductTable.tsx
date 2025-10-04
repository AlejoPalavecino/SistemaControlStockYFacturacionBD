
import React, { memo } from 'react';
import { Product } from '../../types/product.ts';
import { formatARS } from '../../utils/format.ts';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

// SVG Icons for actions
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const StatusPill: React.FC<{ stock: number; minStock: number }> = ({ stock, minStock }) => {
    const isLowStock = stock < minStock;
    const pillClasses = isLowStock
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-green-100 text-green-800';
    const Icon = isLowStock 
        ? () => <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        : () => <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${pillClasses}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <Icon />
            </svg>
            {isLowStock ? 'Bajo stock' : 'OK'}
        </span>
    );
};


export const ProductTable: React.FC<ProductTableProps> = memo(({ products, onEdit, onDelete }) => {

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
      <table className="w-full text-left">
        <thead className="text-sm text-slate-600 uppercase bg-slate-100 font-semibold tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-4">SKU</th>
            <th scope="col" className="px-6 py-4">Nombre</th>
            <th scope="col" className="px-6 py-4">Categoría</th>
            <th scope="col" className="px-6 py-4 text-right">Precio (ARS)</th>
            <th scope="col" className="px-6 py-4 text-center">Stock</th>
            <th scope="col" className="px-6 py-4 text-center">Mín.</th>
            <th scope="col" className="px-6 py-4">Estado</th>
            <th scope="col" className="px-6 py-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="bg-white border-b hover:bg-slate-50 text-base">
              <td className="px-6 py-4 font-mono text-base text-slate-700">{product.sku}</td>
              <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                {product.name}
              </th>
              <td className="px-6 py-4 text-slate-700">{product.category}</td>
              <td className="px-6 py-4 text-right text-slate-700">{formatARS(product.priceARS)}</td>
              <td className="px-6 py-4 text-center font-medium text-slate-800" aria-live="polite">{product.stock}</td>
              <td className="px-6 py-4 text-center text-slate-700">{product.minStock}</td>
              <td className="px-6 py-4">
                <StatusPill stock={product.stock} minStock={product.minStock} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    <button 
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        aria-label={`Editar ${product.name}`} 
                        title={`Editar ${product.name}`}
                        onClick={() => onEdit(product)}
                    >
                        <EditIcon />
                    </button>
                    <button 
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors" 
                        aria-label={`Eliminar ${product.name}`} 
                        title={`Eliminar ${product.name}`}
                        onClick={() => onDelete(product)}
                    >
                        <DeleteIcon />
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
