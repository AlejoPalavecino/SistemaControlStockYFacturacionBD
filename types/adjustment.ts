export type AdjustmentId = string;
export type AdjustmentType = 'DEBIT' | 'CREDIT';

export interface AccountAdjustment {
  id: AdjustmentId;
  clientId: string;
  type: AdjustmentType;
  amountARS: number;
  date: string; // ISO date string for the adjustment date
  description: string;
  createdAt: string; // ISO date string for creation record
}