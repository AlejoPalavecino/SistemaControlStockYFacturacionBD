import React, { useState, useCallback } from 'react';
// FIX: Changed react-router-dom import to use namespace import to fix module resolution issues.
import * as Router from 'react-router-dom';
import { useClientDetails } from '../hooks/useClientDetails';
import { formatARS } from '../utils/format';
import ClientHistoryTable from '../components/clients/ClientHistoryTable';
import { PaymentModal } from '../components/clients/PaymentModal';
import { DebtModal } from '../components/clients/DebtModal';
import { ClientForm } from '../components/clients/ClientForm';
import { Payment } from '../types/payment';
import { Client } from '../types/client';
import { AccountAdjustment } from '../types/adjustment';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { PageHeader } from '../components/shared/PageHeader';

export const ClientDetail: React.FC = () => {
    const { clientId } = Router.useParams<{ clientId: string }>();
    const { client, debt, history, loading, error, addPayment, updateClient, addAdjustment } = useClientDetails(clientId!);
    
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isDebtModalOpen, setDebtModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(!clientId);

    const handleSavePayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'clientId'>) => {
        await addPayment(paymentData);
        setPaymentModalOpen(false);
    }, [addPayment]);

    const handleSaveAdjustment = useCallback(async (adjustmentData: Omit<AccountAdjustment, 'id' | 'createdAt' | 'clientId'>) => {
        await addAdjustment(adjustmentData);
    }, [addAdjustment]);

    const handleSaveClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (clientId) {
                await updateClient(clientData);
                setIsEditing(false);
            }
        } catch (e) {
            // Error handled by hook
        }
    }, [clientId, updateClient]);
    
    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    if (error) return <div className="text-red-500 p-8">{error}</div>;
    if (!client) return <div className="p-8">Cliente no encontrado.</div>;


    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <PageHeader 
                title={client.name}
                subtitle={`${client.docType}: ${client.docNumber} • ${client.email}`}
            />

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    <div className="mb-4 md:mb-0">
                        <p className="text-sm text-slate-600 mb-1">Estado de cuenta</p>
                        <p className="text-sm text-slate-700">{client.name}</p>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-sm text-slate-600 mb-1">Deuda Total</p>
                        <p className={`text-2xl font-bold ${debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatARS(debt)}
                        </p>
                    </div>
                </div>
            </div>

            <main>
                {isEditing ? (
                     <ClientForm 
                        clientToEdit={client}
                        onSave={handleSaveClient}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <>
                        <div className="flex flex-wrap justify-end mb-6 gap-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white text-slate-800 font-semibold text-base py-2.5 px-5 rounded-lg border border-slate-300 hover:bg-slate-50"
                            >
                                Editar Cliente
                            </button>
                            <button
                                onClick={() => setDebtModalOpen(true)}
                                className="bg-white text-slate-800 font-semibold text-base py-2.5 px-5 rounded-lg border border-slate-300 hover:bg-slate-50"
                            >
                                Registrar Deuda/Ajuste
                            </button>
                            <button
                                onClick={() => setPaymentModalOpen(true)}
                                className="bg-blue-600 text-white font-semibold text-base py-2.5 px-5 rounded-lg shadow-md hover:bg-blue-700"
                            >
                                Registrar Pago
                            </button>
                        </div>
                        
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
                            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Historial de Cuenta Corriente</h2>
                            <ClientHistoryTable history={history} />
                        </div>
                    </>
                )}
            </main>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onSave={handleSavePayment}
            />
            
            <DebtModal
                isOpen={isDebtModalOpen}
                onClose={() => setDebtModalOpen(false)}
                onSave={handleSaveAdjustment}
            />

        </div>
    );
};