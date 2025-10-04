
import { PaymentMethod, IvaRate } from './common';
// FIX: Re-export imported types so they are available to other modules importing from this file.
export type { PaymentMethod, IvaRate };

export type InvoiceId = string;
export type InvoiceStatus = 'BORRADOR' | 'EMITIDA' | 'ANULADA';
export type InvoiceType = 'A' | 'B' | 'C';
export type Concept = 'PRODUCTOS';

export interface InvoiceItem {
  productId: string;
  sku: string;
  name: string;
  qty: number;
  unitPriceARS: number; // Price with VAT included
  taxRate: IvaRate;
  lineTotalARS: number; // unitPriceARS * qty
}

export interface InvoiceTotals {
  netARS: number;       // Calculated backward from price with VAT
  ivaARS: number;
  totalARS: number;     // Sum of lineTotalARS
}

export interface Invoice {
  id: InvoiceId;
  type: InvoiceType;
  concept: Concept;
  pos: string;              // Point of sale, e.g., '0001'
  number: string;           // Formatted correlative: '00000001'
  clientId: string;
  clientName: string;
  clientDocType: 'DNI' | 'CUIT' | 'CUIL' | 'SD';
  clientDocNumber: string;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  cae?: string;             // Simulated CAE when issued
  caeDue?: string;          // Simulated (today + 7 days)
  createdAt: string;
  updatedAt: string;
}