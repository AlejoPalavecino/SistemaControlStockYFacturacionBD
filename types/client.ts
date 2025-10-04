export type DocType = 'DNI' | 'CUIT' | 'CUIL' | 'SD';
export type IvaCondition = 'RI' | 'MONOTRIBUTO' | 'CF';

export interface Client {
  id: string;
  name: string;
  docType: DocType;
  docNumber: string;
  ivaCondition: IvaCondition;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ClientWithDebt extends Client {
  debt: number;
}

export type ClientImportRow = Partial<Pick<Client, 'name' | 'docType' | 'docNumber' | 'ivaCondition' | 'email' | 'phone' | 'address' | 'notes' | 'active'>>;

export interface ClientImportResult {
  successCount: number;
  errors: { item: ClientImportRow; reason: string }[];
}