import React, { memo } from 'react';

interface EmptyStateProps {
  onSeed: () => void;
}

const EmptyBoxIcon = () => (
    <svg className="mx-auto h-24 w-24 text-slate-300" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24,2A22,22,0,1,0,46,24,22,22,0,0,0,24,2ZM13.5,32.8,11.2,35A17.9,17.9,0,0,1,8,24a18.1,18.1,0,0,1,3.2-11l2.3,2.2A14,14,0,0,0,12,24,13.9,13.9,0,0,0,13.5,32.8ZM24,42A17.9,17.9,0,0,1,11,36.8l-2.2,2.3A21.9,21.9,0,0,0,24,46a21.9,21.9,0,0,0,15.2-6.5L37,37.2A17.9,17.9,0,0,1,24,42ZM37.2,13.5,35,11.2A17.9,17.9,0,0,1,40,24a18.1,18.1,0,0,1-3.2,11l-2.3-2.2A14,14,0,0,0,36,24,13.9,13.9,0,0,0,37.2,13.5Z" strokeWidth="1" />
        <path d="M33.2,16.2,29,20.4,24.8,16.2" strokeWidth="1"/>
        <path d="M14.8,31.8,19,27.6l4.2,4.2" strokeWidth="1"/>
        <rect x="18" y="15" width="12" height="18" rx="2" strokeWidth="1"/>
    </svg>
);


export const EmptyState: React.FC<EmptyStateProps> = memo(({ onSeed }) => {
  return (
    <div className="text-center bg-white rounded-lg shadow-sm border-2 border-dashed border-slate-200 p-12">
      <EmptyBoxIcon />
      <h3 className="mt-4 text-xl font-semibold text-slate-800">No hay productos en tu inventario</h3>
      <p className="mt-2 text-sm text-slate-500">
        Puedes empezar creando un nuevo producto o cargar datos de prueba para ver cómo funciona.
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
