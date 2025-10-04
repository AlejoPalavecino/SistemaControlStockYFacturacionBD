
import { Category } from '../types/product.ts';

/**
 * Generates a product SKU based on its name and category.
 * Format: {CAT}-{slug3}-{rand3}, e.g., LIB-LAP-7F2
 * @param name - The product name.
 * @param category - The product category.
 * @param forceRandom - If true, always appends a random suffix, useful for retries.
 * @returns A generated SKU string.
 */
export const generarSKU = (name: string, category: Category, forceRandom: boolean = false): string => {
  const catCode = category.substring(0, 3).toUpperCase();
  
  const nameSlug = name
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
    .substring(0, 3)
    .toUpperCase();

  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `${catCode}-${nameSlug}-${randomSuffix}`;
};
