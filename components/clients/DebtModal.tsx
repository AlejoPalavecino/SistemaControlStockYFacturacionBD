import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { AccountAdjustment, AdjustmentType } from '../../types/adjustment';

interface DebtModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (adjustmentData: Omit<AccountAdjustment, 'id' | 'createdAt' | 'clientId'>) => Promise<void>;
}

export const DebtModal: React.FC<DebtModalProps> = ({ isOpen, onClose, onSave }) => {
    const [amountARS, setAmountARS] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<AdjustmentType>('DEBIT');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        const amount = parseFloat(amountARS);
        if (isNaN(amount) || amount <= 0) {
            setError("El monto debe ser un número positivo.");
            return;
        }
        if (!description.trim()) {
            setError("La descripción es obligatoria.");
            return;
        }
        setError('');
        setIsSaving(true);
        try {
            await onSave({
                amountARS: amount,
                date: new Date(date).toISOString(),
                type,
                description,
            });
            // Reset form on success
            setAmountARS('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error al guardar el ajuste.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleClose = () => {
        setError('');
        setIsSaving(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Deuda / Ajuste">
            <div className="space-y-4">
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-700">Tipo de Ajuste</label>
                    <select value={type} onChange={e => setType(e.target.value as AdjustmentType)} className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg">
                        <option value="DEBIT">Deuda (Débito)</option>
                        <option value="CREDIT">Saldo a favor (Crédito)</option>
                    </select>
                </div>
                 <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-700">Monto (ARS)</label>
                    <input type="number" value={amountARS} onChange={e => setAmountARS(e.target.value)} className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg" placeholder="0.00" />
                </div>
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-700">Fecha</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg" />
                </div>
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-700">Descripción</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg" placeholder="Ej: Saldo inicial, Recargo, etc." />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={handleClose} className="text-sm font-semibold text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-100">Cancelar</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50">
                        {isSaving ? 'Guardando...' : 'Guardar Ajuste'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};