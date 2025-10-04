import React, { useState } from 'react';
import { Modal } from '../shared/Modal.tsx';
// FIX: Corrected import path for SupplierPayment and PaymentMethod types.
import { SupplierPayment, PaymentMethod } from '../../types/supplierPayment.ts';

interface SupplierPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (paymentData: Omit<SupplierPayment, 'id' | 'createdAt' | 'supplierId'>) => Promise<void>;
}

export const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = ({ isOpen, onClose, onSave }) => {
    const [amountARS, setAmountARS] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFERENCIA');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        const amount = parseFloat(amountARS);
        if (isNaN(amount) || amount <= 0) {
            setError("El monto debe ser un número positivo.");
            return;
        }
        setError('');
        setIsSaving(true);
        try {
            await onSave({
                amountARS: amount,
                date: new Date(date).toISOString(),
                paymentMethod,
                notes,
            });
            // Reset form
            setAmountARS('');
            setNotes('');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error al guardar el pago.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago a Proveedor">
            <div className="space-y-4">
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-700">Monto (ARS)</label>
                    <input 
                        type="number" 
                        value={amountARS} 
                        onChange={e => setAmountARS(e.target.value)} 
                        className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg" 
                        placeholder="0.00"
                        aria-label="Monto del pago en pesos argentinos"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha del Pago</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        aria-label="Fecha del pago"
                        className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
                    <select 
                        value={paymentMethod} 
                        onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} 
                        aria-label="Seleccionar método de pago"
                        className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="CHEQUE">Cheque</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-700">Notas (Opcional)</label>
                    <input 
                        type="text" 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg" 
                        placeholder="Ej: N° de comprobante"
                        aria-label="Notas adicionales del pago"
                    />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="text-sm font-semibold text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-100">Cancelar</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50">
                        {isSaving ? 'Guardando...' : 'Guardar Pago'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};