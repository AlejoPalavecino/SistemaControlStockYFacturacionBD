
import React, { useState, useCallback } from 'react';
// FIX: Changed react-router-dom import to use namespace import to fix module resolution issues.
import * as Router from 'react-router-dom';
import { useSuppliers } from '../hooks/useSuppliers.ts';
import { Supplier, SupplierWithDebt } from '../types/supplier.ts';
import { SupplierTable } from '../components/suppliers/SupplierTable.tsx';
import { SupplierForm } from '../components/suppliers/SupplierForm.tsx';
import { EmptyState } from '../components/suppliers/EmptyState.tsx';
import { SupplierImport } from '../components/suppliers/SupplierImport.tsx';
import { Modal } from '../components/shared/Modal.tsx';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.tsx';
import { PageHeader } from '../components/shared/PageHeader.tsx';
import { 
  PlusIcon, 
  ExportIcon, 
  ImportIcon, 
  SearchIcon 
} from '../components/shared/Icons.tsx';

const Proveedores: React.FC = () => {
  const {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deactivateSupplier,
    seedIfEmpty,
    importSuppliers,
    exportSuppliers,
    searchQuery,
    setSearchQuery,
    onlyActive,
    setOnlyActive,
    sortBy,
    setSortBy,
  } = useSuppliers();

  const [editingSupplier, setEditingSupplier] = useState<Supplier | 'new' | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const handleFormSave = useCallback(async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSupplier && editingSupplier !== 'new') {
      await updateSupplier(editingSupplier.id, supplierData);
    } else {
      await createSupplier(supplierData);
    }
    setEditingSupplier(null);
  }, [editingSupplier, createSupplier, updateSupplier]);

  if (loading && !suppliers.length) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <PageHeader 
          title="Proveedores"
          subtitle="Gestiona tu base de datos de proveedores"
        />
        <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  const renderContent = () => {
    if (editingSupplier) {
        return <SupplierForm
            supplierToEdit={editingSupplier === 'new' ? undefined : editingSupplier}
            onSave={handleFormSave}
            onCancel={() => setEditingSupplier(null)}
        />
    }
    return (
        <>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-slate-400" /></div>
              <input type="text" placeholder="Buscar por Razón Social o CUIT..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 text-base text-slate-900 border border-slate-300 rounded-lg bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="form-select w-full sm:w-auto text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2.5" aria-label="Ordenar proveedores">
              <option value="businessName">Ordenar por Razón Social</option>
              <option value="cuit">Ordenar por CUIT</option>
              <option value="debt">Ordenar por Deuda</option>
              <option value="createdAt">Ordenar por Fecha Creación</option>
            </select>
            <label className="flex items-center text-base font-medium text-slate-700">
              <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2">Mostrar solo activos</span>
            </label>
          </div>

        {suppliers.length > 0 ? (
            <SupplierTable suppliers={suppliers} onEdit={setEditingSupplier} onToggleActive={deactivateSupplier} />
        ) : (
            <EmptyState onSeed={seedIfEmpty} />
        )}
        </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader 
        title="Proveedores"
        subtitle="Gestiona tu base de datos de proveedores"
        actions={
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setEditingSupplier('new')} className="inline-flex items-center bg-blue-600 text-white font-semibold text-base py-2.5 px-5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Proveedor
            </button>
            <button onClick={() => setImportModalOpen(true)} className="inline-flex items-center bg-white text-slate-800 font-semibold text-base py-2.5 px-5 rounded-lg border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <ImportIcon className="h-5 w-5 mr-2" />
              Importar JSON
            </button>
            <button onClick={() => exportSuppliers('excel')} className="inline-flex items-center bg-white text-slate-800 font-semibold text-base py-2.5 px-5 rounded-lg border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <ExportIcon className="h-5 w-5 mr-2" />
              Exportar Excel
            </button>
          </div>
        }
      />
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {renderContent()}

      <Modal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} title="Importar Proveedores">
        <SupplierImport onImport={importSuppliers} onClose={() => setImportModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Proveedores;