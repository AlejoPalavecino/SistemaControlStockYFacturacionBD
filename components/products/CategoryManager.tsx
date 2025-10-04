import React, { useState, memo } from 'react';

interface CategoryManagerProps {
  categories: string[];
  onAdd: (name: string) => Promise<void>;
  onUpdate: (oldName: string, newName: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  error: string | null;
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CancelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const CategoryManager: React.FC<CategoryManagerProps> = memo(({ categories, onAdd, onUpdate, onDelete, error }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      await onAdd(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleStartEdit = (cat: string) => {
    setEditingCategory({ oldName: cat, newName: cat });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleSaveEdit = async () => {
    if (editingCategory && editingCategory.newName.trim()) {
      await onUpdate(editingCategory.oldName, editingCategory.newName.trim());
      setEditingCategory(null);
    }
  };
  
  return (
    <div>
      {error && <p role="alert" className="text-red-600 text-sm mb-4">{error}</p>}
      
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nueva categoría..."
          className="flex-grow w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Añadir
        </button>
      </form>

      <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
        <ul className="divide-y divide-slate-200">
          {categories.map(cat => (
            <li key={cat} className="p-3 flex items-center justify-between">
              {editingCategory?.oldName === cat ? (
                <input
                  type="text"
                  value={editingCategory.newName}
                  onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                  aria-label="Editar nombre de categoría"
                  placeholder="Nombre de la categoría"
                  className="flex-grow px-2 py-1 text-base text-slate-900 bg-white border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <span className="text-slate-700">{cat}</span>
              )}

              <div className="flex gap-1.5 ml-2">
                {editingCategory?.oldName === cat ? (
                  <>
                    <button onClick={handleSaveEdit} className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-md transition-colors" title="Guardar">
                      <SaveIcon />
                    </button>
                    <button onClick={handleCancelEdit} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors" title="Cancelar">
                      <CancelIcon />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleStartEdit(cat)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Editar">
                      <EditIcon />
                    </button>
                    <button onClick={() => onDelete(cat)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors" title="Eliminar">
                      <DeleteIcon />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
