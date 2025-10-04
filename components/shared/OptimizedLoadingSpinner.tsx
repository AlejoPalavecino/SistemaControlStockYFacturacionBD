import React, { memo } from 'react';

const OptimizedLoadingSpinner: React.FC = memo(() => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-sm">Cargando...</p>
      </div>
    </div>
  );
});

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner';

export { OptimizedLoadingSpinner };