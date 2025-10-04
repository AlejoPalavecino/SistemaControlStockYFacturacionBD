

import { ProductId } from './product';

export type StockMovementType = 'creation' | 'manual_adjustment' | 'deletion' | 'import' | 'sale';

export interface StockMovement {
  id: string; // Unique ID for the movement
  productId: ProductId;
  productSku: string;
  productName: string;
  timestamp: string; // ISO date string
  type: StockMovementType;
  change: number; // e.g., +50, -5
  newStock: number; // The resulting stock level
  notes?: string; // Optional context, e.g., "Imported from file.xlsx"
}