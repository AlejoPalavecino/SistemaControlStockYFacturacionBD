
import React, { useState, useCallback } from 'react';
// FIX: Changed react-router-dom import to use namespace import to fix module resolution issues.
import * as Router from 'react-router-dom';
import { useClients } from '../hooks/useClients.ts';
import { Client, ClientWithDebt } from '../types/client.ts';
import { ClientTable } from '../components/clients/ClientTable.tsx';
import { ClientForm } from '../components/clients/ClientForm.tsx';
import { EmptyState } from '../components/clients/EmptyState.tsx';
import { ClientImport } from '../components/clients/ClientImport.tsx';
import { Modal } from '../components/shared/Modal.tsx';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.tsx';
import { PageHeader } from '../components/shared/PageHeader.tsx';
import { 
  PlusIcon, 
  ExportIcon, 
  ImportIcon, 
  SearchIcon 
} from '../components/shared/Icons.tsx';

const Clientes: React.FC = () => {
  const {
    clients,
    loading,
    error,
    createClient,
    deactivateClient,
    seedIfEmpty,
    importClients,
    exportClients,
    searchQuery,
    setSearchQuery,
    onlyActive,
    setOnlyActive,
    sortBy,
    setSortBy,
  } = useClients();

  const [isNewClientModalOpen, setNewClientModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const handleFormSave = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createClient(clientData);
    setNewClientModalOpen(false);
  }, [createClient]);

  if (loading) {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <PageHeader 
              title="Clientes"
              showBackButton={true}
            />
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader 
        title="Clientes"
        subtitle="Gestiona tus clientes y controla cuentas corrientes"
        showBackButton={true}
      />

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      
      <>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center justify-center bg-blue-600 text-white font-semibold text-base py-2.5 px-5 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors" onClick={() => setNewClientModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" /> Nuevo Cliente
            </button>
            <button onClick={() => setImportModalOpen(true)} className="flex items-center justify-center bg-white text-slate-800 font-semibold text-base py-2.5 px-5 rounded-lg border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <ImportIcon className="h-5 w-5 mr-2" /> Importar JSON
            </button>
            <button onClick={() => exportClients('excel')} className="flex items-center justify-center bg-white text-slate-800 font-semibold text-base py-2.5 px-5 rounded-lg border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <ExportIcon className="h-5 w-5 mr-2" /> Exportar Excel
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-slate-400" /></div>
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 text-base text-slate-900 border border-slate-300 rounded-lg bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="form-select w-full sm:w-auto text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2.5"
            aria-label="Ordenar clientes"
          >
            <option value="name">Ordenar por Nombre</option>
            <option value="debt">Ordenar por Deuda</option>
            <option value="docNumber">Ordenar por Documento</option>
            <option value="createdAt">Ordenar por Fecha Creación</option>
          </select>
          <label className="flex items-center text-base font-medium text-slate-700">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">Mostrar solo activos</span>
          </label>
        </div>

        {clients.length > 0 ? (
          <ClientTable
            clients={clients}
            onToggleActive={deactivateClient}
          />
        ) : (
          <EmptyState onSeed={seedIfEmpty} />
        )}
      </>

      <Modal isOpen={isNewClientModalOpen} onClose={() => setNewClientModalOpen(false)} title="Nuevo Cliente" size="4xl">
         <ClientForm
            onSave={handleFormSave}
            onCancel={() => setNewClientModalOpen(false)}
          />
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} title="Importar Clientes">
        <ClientImport onImport={importClients} />
      </Modal>
    </div>
  );
};

export default Clientes;