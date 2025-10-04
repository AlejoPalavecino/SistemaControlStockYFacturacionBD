import React, { memo } from 'react';

interface EmptyStateProps {
  onSeed: () => void;
}

const EmptyTruckIcon = () => (
    <svg className="mx-auto h-24 w-24 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" />
    </svg>
);


export const EmptyState: React.FC<EmptyStateProps> = memo(({ onSeed }) => {
  return (
    <div className="text-center bg-white rounded-lg shadow-sm border-2 border-dashed border-slate-200 p-12">
      <EmptyTruckIcon />
      <h3 className="mt-4 text-xl font-semibold text-slate-800">No hay proveedores registrados</h3>
      <p className="mt-2 text-sm text-slate-500">
        Puedes crear un nuevo proveedor o cargar datos de prueba para empezar.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onSeed}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Cargar datos de prueba
        </button>
      </div>
    </div>
  );
});
