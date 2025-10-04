import { useState, useEffect, useCallback, useRef } from 'react';
import * as invoicesRepo from '../services/db/invoicesRepo.ts';
import * as productsRepo from '../services/db/productsRepo.ts';
import { Invoice } from '../types/invoice.ts';
import { sumTotals } from '../utils/tax.ts';
import { useAuth } from '../context/AuthContext.tsx';

declare var XLSX: any;

export function useInvoices() {
    const { currentUser } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastFetchTime = useRef<number>(0);
    const CACHE_DURATION = 30000; // 30 segundos de cache

    const fetchInvoices = useCallback(async (force = false) => {
        if (!currentUser) {
            setInvoices([]);
            setLoading(false);
            return;
        }
        
        // Evitar refetches muy frecuentes
        const now = Date.now();
        if (!force && now - lastFetchTime.current < CACHE_DURATION) {
            return;
        }
        
        try {
            setLoading(true);
            const data = await invoicesRepo.list(currentUser.uid);
            setInvoices(data);
            setError(null);
            lastFetchTime.current = now;
        } catch (e) {
            setError('No se pudieron cargar las facturas.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const getById = useCallback(async (id: string): Promise<Invoice | null> => {
        if (!currentUser) return null;
        return await invoicesRepo.getById(currentUser.uid, id);
    }, [currentUser]);

    const createDraft = useCallback(async (): Promise<Invoice | null> => {
        if (!currentUser) return null;
        const newDraft = await invoicesRepo.create(currentUser.uid, {});
        
        // Agregar al estado local en lugar de refetch
        setInvoices(prev => [newDraft, ...prev]);
        
        return newDraft;
    }, [currentUser]);
    
    const updateInvoice = useCallback(async (id: string, invoiceData: Invoice): Promise<Invoice> => {
        if (!currentUser) throw new Error("User not authenticated.");
        const invoiceWithTotals = {
            ...invoiceData,
            totals: sumTotals(invoiceData.items),
        };
        const updated = await invoicesRepo.update(currentUser.uid, id, invoiceWithTotals);
        
        // Actualizar estado local en lugar de refetch completo
        setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
        
        return updated;
    }, [currentUser]);
    
    const issueInvoice = useCallback(async (invoiceData: Invoice): Promise<Invoice> => {
        if (!currentUser) throw new Error("User not authenticated.");
        if (invoiceData.status !== 'BORRADOR') throw new Error('Solo se pueden emitir borradores.');
        if (!invoiceData.clientId) throw new Error('Debe seleccionar un cliente.');
        if (invoiceData.items.length === 0) throw new Error('La factura debe tener al menos un ítem.');

        const userId = currentUser.uid;

        for (const item of invoiceData.items) {
            const product = await productsRepo.getById(userId, item.productId);
            if (!product || product.stock < item.qty) {
                throw new Error(`Stock insuficiente para "${item.name}". Stock disponible: ${product?.stock || 0}.`);
            }
        }
        
        const finalDraftData = { ...invoiceData, totals: sumTotals(invoiceData.items) };
        const issuedInvoice = await invoicesRepo.issue(userId, finalDraftData);

        for (const item of issuedInvoice.items) {
            await productsRepo.adjustStock(userId, item.productId, -item.qty, 'sale', `Venta - Factura ${issuedInvoice.pos}-${issuedInvoice.number}`);
        }
        
        // Actualizar estado local
        setInvoices(prev => prev.map(inv => inv.id === issuedInvoice.id ? issuedInvoice : inv));
        
        return issuedInvoice;
    }, [currentUser]);

    const cancelInvoice = useCallback(async (id: string): Promise<Invoice> => {
        if (!currentUser) throw new Error("User not authenticated.");
        const invoice = await getById(id);
        if (!invoice) throw new Error('Factura no encontrada.');
        if (invoice.status !== 'EMITIDA') throw new Error('Solo se pueden anular facturas emitidas.');
        
        const cancelled = await invoicesRepo.setStatus(currentUser.uid, id, 'ANULADA');
        
        // Actualizar estado local
        setInvoices(prev => prev.map(inv => inv.id === id ? cancelled : inv));
        
        return cancelled;
    }, [currentUser, getById]);
    
    const removeDraft = useCallback(async(id: string): Promise<void> => {
        if (!currentUser) throw new Error("User not authenticated.");
        const invoice = await getById(id);
        if (!invoice || invoice.status !== 'BORRADOR') throw new Error('Solo se pueden eliminar borradores.');
        await invoicesRepo.remove(currentUser.uid, id);
        
        // Remover del estado local
        setInvoices(prev => prev.filter(inv => inv.id !== id));
    }, [currentUser, getById]);

    const exportInvoices = useCallback((format: 'excel') => {
        if (format !== 'excel' || typeof XLSX === 'undefined') {
            return;
        }

        const dataToExport = invoices.map(inv => ({
            Numero: `${inv.pos}-${inv.number}`,
            Tipo: inv.type,
            Cliente: inv.clientName,
            Documento: inv.clientDocNumber,
            Fecha: new Date(inv.createdAt).toLocaleDateString('es-AR'),
            Estado: inv.status,
            'Neto ARS': inv.totals.netARS,
            'IVA ARS': inv.totals.ivaARS,
            'Total ARS': inv.totals.totalARS,
            MetodoPago: inv.paymentMethod,
            CAE: inv.cae || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");
        XLSX.writeFile(workbook, "facturas_export.xlsx");

    }, [invoices]);

    return {
        invoices,
        loading,
        error,
        getById,
        createDraft,
        updateInvoice,
        issueInvoice,
        cancelInvoice,
        removeDraft,
        exportInvoices,
    };
}
