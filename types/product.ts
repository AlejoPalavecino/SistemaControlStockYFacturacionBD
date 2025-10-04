export type ProductId = string; // Using string for UUIDs

export type Category = string;

export interface Product {
  id: ProductId;
  sku: string;              // Stock Keeping Unit, generated automatically if not provided
  name: string;
  category: Category;
  priceARS: number;         // Sale price in ARS (gross price for now)
  stock: number;            // Current units on hand
  minStock: number;         // Alert threshold
  active: boolean;          // To deactivate without deleting
  createdAt: string;        // ISO date string
  updatedAt: string;        // ISO date string
}

export interface ProductImportResult {
  successCount: number;
  errors: { item: any; reason: string }[];
}