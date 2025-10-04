
import React, { useState, useEffect, memo } from 'react';
import { Product } from '../../types/product.ts';

interface ProductFormProps {
  productToEdit?: Product;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  categories: string[];
}

const initialFormData = {
  name: '',
  category: '',
  priceARS: 0,
  stock: 0,
  minStock: 0,
  sku: '',
  active: true,
};

export const ProductForm: React.FC<ProductFormProps> = memo(({ productToEdit, onSave, onCancel, categories }) => {
  const [formData, setFormData] = useState(() => ({
      ...initialFormData,
      category: categories[0] || ''
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        category: productToEdit.category,
        priceARS: productToEdit.priceARS,
        stock: productToEdit.stock,
        minStock: productToEdit.minStock,
        sku: productToEdit.sku || '',
        active: productToEdit.active,
      });
    } else {
      setFormData({
        ...initialFormData,
        category: categories[0] || ''
      });
    }
  }, [productToEdit, categories]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (formData.priceARS < 0) newErrors.priceARS = 'El precio no puede ser negativo.';
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo.';
    if (formData.minStock < 0) newErrors.minStock = 'El stock mínimo no puede ser negativo.';
    if (!formData.category) newErrors.category = 'Debe seleccionar una categoría.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | boolean = value;

    if (type === 'number') {
        processedValue = value === '' ? 0 : parseFloat(value);
    }
    if (name === 'active') {
        processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const formFieldClasses = "block w-full px-3 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-lg placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500";
  const labelClasses = "block mb-1.5 text-base font-medium text-slate-700";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className={labelClasses}>Nombre del Producto</label>
            <input
              type="text"
              id="name"
              name="name"
              className={formFieldClasses}
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <p role="alert" className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className={labelClasses}>Categoría</label>
            <select
              id="category"
              name="category"
              className={formFieldClasses}
              value={formData.category}
              onChange={handleChange}
            >
              <option value="" disabled>Seleccione una categoría</option>
              {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p role="alert" className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>
          
          {/* Price */}
          <div>
            <label htmlFor="priceARS" className={labelClasses}>Precio (ARS)</label>
            <input
              type="number"
              id="priceARS"
              name="priceARS"
              className={formFieldClasses}
              value={formData.priceARS}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
            {errors.priceARS && <p role="alert" className="text-red-600 text-sm mt-1">{errors.priceARS}</p>}
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className={labelClasses}>Stock Actual</label>
            <input
              type="number"
              id="stock"
              name="stock"
              className={formFieldClasses}
              value={formData.stock}
              onChange={handleChange}
              min="0"
            />
            {errors.stock && <p role="alert" className="text-red-600 text-sm mt-1">{errors.stock}</p>}
          </div>

          {/* Min Stock */}
          <div>
            <label htmlFor="minStock" className={labelClasses}>Stock Mínimo</label>
            <input
              type="number"
              id="minStock"
              name="minStock"
              className={formFieldClasses}
              value={formData.minStock}
              onChange={handleChange}
              min="0"
            />
            {errors.minStock && <p role="alert" className="text-red-600 text-sm mt-1">{errors.minStock}</p>}
          </div>
          
          {/* SKU */}
          <div className="md:col-span-2">
            <label htmlFor="sku" className={labelClasses}>SKU (opcional)</label>
            <input
              type="text"
              id="sku"
              name="sku"
              className={formFieldClasses}
              value={formData.sku}
              onChange={handleChange}
              placeholder="Se generará automáticamente si se deja en blanco"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          <button 
            type="button" 
            className="text-base font-semibold text-slate-700 py-2.5 px-5 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="bg-blue-600 text-white font-semibold text-base py-2.5 px-5 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Guardar Producto
          </button>
        </div>
      </form>
    </div>
  );
});
