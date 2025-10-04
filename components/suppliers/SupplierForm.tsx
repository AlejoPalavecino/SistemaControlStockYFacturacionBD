
import React, { useState, useEffect, memo } from 'react';
import { Supplier, DocTypeSupplier, IvaCondition, PaymentTerms } from '../../types/supplier';
import { validateSupplierDoc, normalizeCUIT } from '../../utils/doc';
import { isValidCBU, normalizeCBU, normalizeAlias } from '../../utils/bank';

interface SupplierFormProps {
  supplierToEdit?: Supplier;
  onSave: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const initialFormData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'> = {
  businessName: '',
  docType: 'CUIT',
  cuit: '',
  ivaCondition: 'RI',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  contactName: '',
  paymentTerms: 'CONTADO',
  bank: { bankName: '', cbu: '', alias: '' },
  notes: '',
  active: true,
};

export const SupplierForm: React.FC<SupplierFormProps> = memo(({ supplierToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplierToEdit) {
      setFormData({
          ...supplierToEdit,
          bank: supplierToEdit.bank || { bankName: '', cbu: '', alias: '' }
      });
    } else {
      setFormData(initialFormData);
    }
  }, [supplierToEdit]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'La Razón Social es obligatoria.';
    
    const docValidation = validateSupplierDoc(formData.docType, formData.cuit);
    if (!docValidation.ok) newErrors.cuit = docValidation.message || 'Error de validación';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'El formato del email es inválido.';
    }
    
    if (formData.bank?.cbu && !isValidCBU(formData.bank.cbu)) {
        newErrors.cbu = 'El CBU debe tener 22 dígitos.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({ 
        ...prev, 
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'cbu') processedValue = normalizeCBU(value);
    if (name === 'alias') processedValue = normalizeAlias(value);
    
    setFormData(prev => ({
        ...prev,
        bank: {
            ...prev.bank!,
            [name]: processedValue,
        }
    }));
  };
  
  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, cuit: normalizeCUIT(e.target.value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const formFieldClasses = "block w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500";
  const labelClasses = "block mb-1.5 text-base font-medium text-slate-700";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">{supplierToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Datos Generales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <label htmlFor="businessName" className={labelClasses}>Razón Social</label>
            <input type="text" id="businessName" name="businessName" className={formFieldClasses} value={formData.businessName} onChange={handleChange} required />
            {errors.businessName && <p role="alert" className="text-red-600 text-xs mt-1">{errors.businessName}</p>}
          </div>
          
          <div>
            <label htmlFor="docType" className={labelClasses}>Tipo Documento</label>
            <select id="docType" name="docType" className={formFieldClasses} value={formData.docType} onChange={handleChange}>
              {(['CUIT', 'SD'] as DocTypeSupplier[]).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="cuit" className={labelClasses}>CUIT</label>
            <input type="text" id="cuit" name="cuit" className={formFieldClasses} value={formData.cuit} onChange={handleCuitChange} disabled={formData.docType === 'SD'} />
            {errors.cuit && <p role="alert" className="text-red-600 text-xs mt-1">{errors.cuit}</p>}
          </div>

          <div>
            <label htmlFor="ivaCondition" className={labelClasses}>Condición IVA</label>
            <select id="ivaCondition" name="ivaCondition" className={formFieldClasses} value={formData.ivaCondition} onChange={handleChange}>
              {(['RI', 'MONOTRIBUTO', 'EXENTO', 'CF'] as IvaCondition[]).map(c => <option key={c} value={c}>{c === 'CF' ? 'Consumidor Final' : c === 'RI' ? 'Resp. Inscripto' : c}</option>)}
            </select>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4 mt-8">Datos de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <label htmlFor="contactName" className={labelClasses}>Nombre de Contacto</label>
                <input type="text" id="contactName" name="contactName" className={formFieldClasses} value={formData.contactName} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="email" className={labelClasses}>Email</label>
                <input type="email" id="email" name="email" className={formFieldClasses} value={formData.email} onChange={handleChange} />
                {errors.email && <p role="alert" className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
                <label htmlFor="phone" className={labelClasses}>Teléfono</label>
                <input type="text" id="phone" name="phone" className={formFieldClasses} value={formData.phone} onChange={handleChange} />
            </div>
            <div className="lg:col-span-3">
                <label htmlFor="address" className={labelClasses}>Dirección</label>
                <input type="text" id="address" name="address" className={formFieldClasses} value={formData.address} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="city" className={labelClasses}>Ciudad</label>
                <input type="text" id="city" name="city" className={formFieldClasses} value={formData.city} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="province" className={labelClasses}>Provincia</label>
                <input type="text" id="province" name="province" className={formFieldClasses} value={formData.province} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="postalCode" className={labelClasses}>Código Postal</label>
                <input type="text" id="postalCode" name="postalCode" className={formFieldClasses} value={formData.postalCode} onChange={handleChange} />
            </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4 mt-8">Condiciones y Datos Bancarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <label htmlFor="paymentTerms" className={labelClasses}>Condiciones de Pago</label>
                <select id="paymentTerms" name="paymentTerms" className={formFieldClasses} value={formData.paymentTerms} onChange={handleChange}>
                    <option value="CONTADO">Contado</option>
                    <option value="CTA_CTE_15">Cta Cte 15 días</option>
                    <option value="CTA_CTE_30">Cta Cte 30 días</option>
                    <option value="CTA_CTE_60">Cta Cte 60 días</option>
                </select>
            </div>
            <div>
                <label htmlFor="bankName" className={labelClasses}>Banco</label>
                <input type="text" id="bankName" name="bankName" className={formFieldClasses} value={formData.bank?.bankName || ''} onChange={handleBankChange} />
            </div>
            <div>
                <label htmlFor="cbu" className={labelClasses}>CBU</label>
                <input type="text" id="cbu" name="cbu" className={formFieldClasses} value={formData.bank?.cbu || ''} onChange={handleBankChange} />
                {errors.cbu && <p role="alert" className="text-red-600 text-xs mt-1">{errors.cbu}</p>}
            </div>
            <div>
                <label htmlFor="alias" className={labelClasses}>Alias</label>
                <input type="text" id="alias" name="alias" className={formFieldClasses} value={formData.bank?.alias || ''} onChange={handleBankChange} />
            </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4 mt-8">Otros Datos</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="notes" className={labelClasses}>Notas</label>
            <textarea id="notes" name="notes" rows={3} className={formFieldClasses} value={formData.notes} onChange={handleChange}></textarea>
          </div>
          <div>
            <label className="flex items-center text-base font-medium text-slate-700">
              <input type="checkbox" name="active" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={formData.active} onChange={handleChange} />
              <span className="ml-2">Proveedor Activo</span>
            </label>
          </div>
        </div>


        <div className="mt-8 flex items-center justify-end gap-4">
          <button type="button" onClick={onCancel} className="text-base font-semibold text-slate-700 py-2.5 px-5 rounded-lg hover:bg-slate-100">Cancelar</button>
          <button type="submit" className="bg-blue-600 text-white font-semibold text-base py-2.5 px-5 rounded-lg shadow-md hover:bg-blue-700">Guardar Proveedor</button>
        </div>
      </form>
    </div>
  );
});
