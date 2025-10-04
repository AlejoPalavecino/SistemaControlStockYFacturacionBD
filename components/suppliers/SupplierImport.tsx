import React, { useState } from 'react';
import { SupplierImportRow, SupplierImportResult } from '../../types/supplier';

declare var XLSX: any;

interface SupplierImportProps {
  onImport: (suppliers: SupplierImportRow[]) => Promise<SupplierImportResult>;
  onClose: () => void;
}

export const SupplierImport: React.FC<SupplierImportProps> = ({ onImport, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<SupplierImportRow[]>([]);
  const [result, setResult] = useState<SupplierImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = (fileToParse: File) => {
    const reader = new FileReader();
    const isCSV = fileToParse.name.endsWith('.csv');

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let jsonData: SupplierImportRow[];

        if (isCSV) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
          jsonData = JSON.parse(data as string);
        }
        
        if (!Array.isArray(jsonData)) throw new Error("El archivo debe contener un array de objetos.");
        setPreview(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el archivo.');
        setPreview([]);
      }
    };

    if (isCSV) {
      reader.readAsBinaryString(fileToParse);
    } else {
      reader.readAsText(fileToParse);
    }
  };

  const handleImportClick = async () => {
    if (!preview.length) {
      setError("No hay datos para importar o el archivo no pudo ser leído.");
      return;
    }
    const importResult = await onImport(preview);
    setResult(importResult);
  };

  return (
    <div>
      {!result ? (
        <>
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="file_input">
                Seleccionar archivo (.csv o .json)
                </label>
                <input 
                className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none" 
                id="file_input" 
                type="file" 
                accept=".csv,.json"
                onChange={handleFileChange}
                />
                <p className="mt-1 text-xs text-gray-500">Cabeceras: businessName, cuit, ivaCondition, etc.</p>
            </div>
            {error && <p role="alert" className="text-red-500 text-sm mb-4">{error}</p>}
            {preview.length > 0 && (
                <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-2">Previsualización (primeras {preview.slice(0, 10).length} filas)</h4>
                <div className="overflow-x-auto max-h-40 border border-slate-200 rounded-lg">
                    <table className="w-full text-xs">
                    <thead className="bg-slate-100">
                        <tr>{Object.keys(preview[0]).map(key => <th key={key} className="p-2 text-left">{key}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {preview.slice(0,10).map((row, i) => (
                        <tr key={i}>{Object.values(row).map((val, j) => <td key={j} className="p-2 whitespace-nowrap">{String(val)}</td>)}</tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="text-sm font-semibold text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-100">Cancelar</button>
                <button onClick={handleImportClick} disabled={!preview.length} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50">
                    Importar {preview.length} Proveedores
                </button>
            </div>
        </>
      ) : (
        <div aria-live="polite">
          <h4 className="font-semibold text-slate-800">Resultado de la Importación</h4>
          <p className="text-green-600 mt-2">{result.successCount} proveedores importados correctamente.</p>
          {result.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600">{result.errors.length} errores encontrados:</p>
              <ul className="list-disc list-inside text-sm text-slate-600 max-h-32 overflow-y-auto mt-1 border p-2 rounded-md">
                {result.errors.map((err, i) => <li key={i}><strong>Fila:</strong> {JSON.stringify(err.item).substring(0,40)}... <br/> <span className="text-red-500"><strong>Error:</strong> {err.reason}</span></li>)}
              </ul>
            </div>
          )}
          <div className="flex justify-end mt-6">
              <button onClick={onClose} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                Entendido
              </button>
          </div>
        </div>
      )}
    </div>
  );
};