import { PaymentMethod } from './payment';
export type { PaymentMethod };

export type SupplierPaymentId = string;

export interface SupplierPayment {
  id: SupplierPaymentId;
  supplierId: string;
  amountARS: number;
  date: string; // ISO
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string; // ISO
}
