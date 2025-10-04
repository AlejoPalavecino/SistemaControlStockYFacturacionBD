import React from 'react';
import { PlusIcon, MinusIcon } from '../shared/Icons.tsx';

interface StockAdjustProps {
  stock: number;
  onAdjust: (delta: number) => void;
}


export const StockAdjust: React.FC<StockAdjustProps> = ({ stock, onAdjust }) => {
  const buttonClasses = "p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-1.5">
      <button
        className={buttonClasses}
        onClick={() => onAdjust(-1)}
        disabled={stock <= 0}
        aria-label="Disminuir stock en 1"
        title="Disminuir stock en 1"
      >
        <MinusIcon className="h-4 w-4" strokeWidth={3} />
      </button>
      <button
        className={buttonClasses}
        onClick={() => onAdjust(1)}
        aria-label="Aumentar stock en 1"
        title="Aumentar stock en 1"
      >
        <PlusIcon className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
  );
};
