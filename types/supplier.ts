export type DocTypeSupplier = 'CUIT' | 'SD';
export type IvaCondition = 'RI' | 'MONOTRIBUTO' | 'EXENTO' | 'CF';
export type PaymentTerms = 'CONTADO' | 'CTA_CTE_15' | 'CTA_CTE_30' | 'CTA_CTE_60';

export interface BankData {
  bankName?: string;
  cbu?: string;          // 22 dígitos
  alias?: string;        // alias alfanumérico (opcional)
}

export interface Supplier {
  id: string;
  businessName: string;    // Razón social o nombre comercial (requerido)
  docType: DocTypeSupplier;// 'CUIT' por defecto
  cuit: string;            // requerido si docType='CUIT'
  ivaCondition: IvaCondition; // 'RI' por defecto
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  contactName?: string;
  paymentTerms: PaymentTerms; // 'CONTADO' por defecto
  bank?: BankData;
  notes?: string;
  active: boolean;           // true por defecto
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
}

export interface SupplierWithDebt extends Supplier {
  debt: number;
}

export type SupplierImportRow = Partial<{
    businessName: string;
    docType: DocTypeSupplier;
    cuit: string;
    ivaCondition: IvaCondition;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    contactName: string;
    paymentTerms: PaymentTerms;
    'bank.bankName': string;
    'bank.cbu': string;
    'bank.alias': string;
    notes: string;
    active: boolean;
}>;

export interface SupplierImportResult {
  successCount: number;
  errors: { item: SupplierImportRow; reason: string }[];
}