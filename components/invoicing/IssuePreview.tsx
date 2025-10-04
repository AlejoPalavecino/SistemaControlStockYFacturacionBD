
import React, { memo } from 'react';
import { Invoice } from '../../types/invoice';
import { formatARS } from '../../utils/format';
import Logo from '../Logo.tsx';

interface IssuePreviewProps {
  invoice: Invoice;
}

export const IssuePreview: React.FC<IssuePreviewProps> = memo(({ invoice }) => {
  return (
    <div className="p-4 sm:p-8 bg-white text-gray-800 font-sans text-sm">
      <div className="border-2 border-gray-200 p-4 sm:p-8 rounded-lg">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-gray-200 gap-4">
          {/* Company Info */}
          <div className="text-xs">
            <div className="mb-3">
              <Logo size="lg" showText={true} />
            </div>
            <p><strong>Razón Social:</strong> Clip Librería</p>
            <p><strong>Domicilio:</strong> Calle Falsa 123, CABA</p>
            <p><strong>Condición IVA:</strong> Responsable Inscripto</p>
          </div>

          {/* Invoice Info */}
          <div className="text-left sm:text-right w-full sm:w-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">FACTURA</h1>
            <div className="text-xs font-mono">
              <p>Punto de Venta: {invoice.pos} Nº: {invoice.number}</p>
              <p>Fecha de Emisión: {new Date(invoice.createdAt).toLocaleDateString('es-AR')}</p>
            </div>
            <div className="mt-4 text-3xl sm:text-4xl font-bold inline-block border-2 border-black px-4 py-2">
              {invoice.type}
            </div>
          </div>
        </header>

        {/* Client Info Section */}
        <section className="mt-6 pb-6 border-b border-gray-200 text-xs">
          <p><strong>Cliente:</strong> {invoice.clientName}</p>
          <p><strong>{invoice.clientDocType}:</strong> {invoice.clientDocNumber}</p>
          <p><strong>Condición frente al IVA:</strong> Consumidor Final</p>
        </section>

        {/* Items Table */}
        <section className="mt-6 overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-xs">
                <th className="p-3">Código</th>
                <th className="p-3">Producto/Servicio</th>
                <th className="p-3 text-center">Cantidad</th>
                <th className="p-3 text-right">P. Unitario</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-3 font-mono text-xs text-slate-500">{item.sku}</td>
                  <td className="p-3 font-medium text-slate-800">{item.name}</td>
                  <td className="p-3 text-center text-slate-700">{item.qty}</td>
                  <td className="p-3 text-right text-slate-700">{formatARS(item.unitPriceARS)}</td>
                  <td className="p-3 text-right font-semibold text-slate-900">{formatARS(item.lineTotalARS)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals Section */}
        <section className="mt-6 flex justify-end">
          <div className="w-full max-w-sm space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal Neto:</span>
              <span className="font-medium text-right">{formatARS(invoice.totals.netARS)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">IVA:</span>
              <span className="font-medium text-right">{formatARS(invoice.totals.ivaARS)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-md mt-2">
              <span className="font-bold text-sm">TOTAL:</span>
              <span className="font-bold text-sm text-right">{formatARS(invoice.totals.totalARS)}</span>
            </div>
          </div>
        </section>

        {/* Footer with CAE and QR */}
        {invoice.status === 'EMITIDA' && invoice.cae && (
          <footer className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            {/* QR Code Placeholder */}
            <div className="w-24 h-24 border-2 border-gray-300 flex items-center justify-center text-slate-400">
              <span>QR</span>
            </div>

            {/* CAE Info */}
            <div className="text-center sm:text-right">
              <p className="font-bold">CAE Nº: <span className="font-mono">{invoice.cae}</span></p>
              <p><strong>Fecha Vto. de CAE:</strong> {invoice.caeDue ? new Date(invoice.caeDue).toLocaleDateString('es-AR') : 'N/A'}</p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
});