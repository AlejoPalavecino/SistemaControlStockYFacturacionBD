
import { DocType } from '../types/client';
import { DocTypeSupplier } from '../types/supplier';

export const normalizeDocNumber = (s: string): string => {
  return (s || '').replace(/[^0-9]/g, '');
};

// New function
export const normalizeCUIT = (s: string): string => {
  return normalizeDocNumber(s);
};

export const isValidDNI = (n: string): boolean => {
  const num = normalizeDocNumber(n);
  return num.length >= 7 && num.length <= 8;
};

export const isValidCUIT = (n: string): boolean => {
  const cuit = normalizeDocNumber(n);
  if (cuit.length !== 11) {
    return false;
  }
  
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cuit[i], 10) * multipliers[i];
  }
  
  const remainder = sum % 11;
  const verifier = remainder === 0 ? 0 : (remainder === 1 ? 9 : 11 - remainder);
  
  return verifier === parseInt(cuit[10], 10);
};

export const validateDoc = (docType: DocType, n: string): { ok: boolean; message?: string } => {
  const num = normalizeDocNumber(n);

  if (docType === 'SD') {
    return { ok: true };
  }
  
  if (!num) {
      return { ok: false, message: 'El número de documento es obligatorio.' };
  }

  switch (docType) {
    case 'DNI':
      if (!isValidDNI(num)) return { ok: false, message: 'El DNI debe tener 7 u 8 dígitos.' };
      break;
    case 'CUIT':
      if (!isValidCUIT(num)) return { ok: false, message: 'El CUIT es inválido.' };
      break;
    case 'CUIL':
       if (!isValidCUIT(num)) return { ok: false, message: 'El CUIL es inválido.' }; // Same validation as CUIT
       break;
  }
  
  return { ok: true };
};

// New function
export const validateSupplierDoc = (docType: DocTypeSupplier, cuit: string): { ok: boolean; message?: string } => {
  if (docType === 'SD') {
    return { ok: true };
  }

  const num = normalizeCUIT(cuit);
  if (!num) {
    return { ok: false, message: 'El CUIT es obligatorio.' };
  }
  if (!isValidCUIT(num)) {
    return { ok: false, message: 'El CUIT es inválido.' };
  }

  return { ok: true };
};