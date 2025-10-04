import React, { memo } from 'react';

interface EmptyStateProps {
  onSeed: () => void;
}

const EmptyUserIcon = () => (
    <svg className="mx-auto h-24 w-24 text-slate-300" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18,34.19c0-3.32,5.37-6,12-6s12,2.68,12,6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M30,25.19A7,7,0,1,0,23,18.19,7,7,0,0,0,30,25.19Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.6,35.6a19.88,19.88,0,0,0,32.8,0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.5,24A21.5,21.5,0,1,1,24,45.5,21.5,21.5,0,0,1,2.5,24Z" />
    </svg>
);


export const EmptyState: React.FC<EmptyStateProps> = memo(({ onSeed }) => {
  return (
    <div className="text-center bg-white rounded-lg shadow-sm border-2 border-dashed border-slate-200 p-12">
      <EmptyUserIcon />
      <h3 className="mt-4 text-xl font-semibold text-slate-800">No tienes clientes registrados</h3>
      <p className="mt-2 text-sm text-slate-500">
        Comienza creando un nuevo cliente o carga datos de prueba para empezar.
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
