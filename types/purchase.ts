export type PurchaseId = string;
export type PurchaseStatus = 'PENDIENTE' | 'PAGADA';

export interface Purchase {
  id: PurchaseId;
  supplierId: string;
  date: string; // ISO
  totalAmountARS: number;
  status: PurchaseStatus;
  notes?: string;
  createdAt: string; // ISO
}
