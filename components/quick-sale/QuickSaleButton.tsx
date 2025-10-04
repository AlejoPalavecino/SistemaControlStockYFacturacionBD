import React from 'react';
import { LightningIcon } from '../shared/Icons.tsx';

interface QuickSaleButtonProps {
  onClick: () => void;
}


export const QuickSaleButton: React.FC<QuickSaleButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform duration-200 ease-in-out hover:scale-105 z-40 flex items-center gap-2"
      aria-label="Iniciar Venta Rápida"
      title="Venta Rápida"
    >
      <LightningIcon className="h-6 w-6" />
      <span className="font-semibold text-base">Venta Rápida</span>
    </button>
  );
};