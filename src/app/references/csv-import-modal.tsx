'use client';

import { FormEvent, useState } from 'react';
import Modal from '@/components/ui/modal';
import type { CsvImportError, CsvImportResult } from './import-csv';

type CsvImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entityType: 'catégories' | 'matériaux' | 'variantes';
  requiredColumns: string[];
  sampleRows: string[];
  importAction: (formData: FormData) => Promise<CsvImportResult>;
  onComplete: () => void;
};

export default function CsvImportModal({
  isOpen,
  onClose,
  title,
  entityType,
  requiredColumns,
  sampleRows,
  importAction,
  onComplete,
}: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData(event.currentTarget);
      const importResult = await importAction(formData);
      setResult(importResult);

      if (importResult.errors.length === 0 && importResult.warnings.length === 0) {
        onComplete();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={reset}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <h3 className="text-sm font-semibold text-indigo-950">Format attendu</h3>
          <p className="mt-1 text-sm text-indigo-800">
            Importez un fichier Excel ou CSV avec une ligne d&apos;en-tête.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {requiredColumns.map((column) => (
              <span
                key={column}
                className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200"
              >
                {column}
              </span>
            ))}
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-indigo-100 bg-white">
            <table className="w-full text-left text-sm">
              <tbody>
                {sampleRows.map((sampleRow, index) => (
                  <tr key={sampleRow} className={index === 0 ? 'bg-indigo-50' : ''}>
                    {sampleRow.split(',').map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 text-indigo-950">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <label
            htmlFor="import-file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50"
          >
            <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              {file ? file.name : 'Déposez votre fichier Excel ici ou cliquez pour le sélectionner'}
            </span>
            <span className="mt-1 text-xs text-gray-500">Formats acceptés: .xlsx, .xls, .csv</span>
            <input
              id="import-file"
              name="csv"
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              required
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
        </div>

        {result && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${result.errors.length === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-950">Import terminé</h3>
                  <p className="mt-1 text-sm text-emerald-900">
                    {result.created} {entityType} créé{result.created > 1 ? 's' : ''}, {result.skipped} ignoré{result.skipped > 1 ? 's' : ''}.
                    {result.errors.length > 0 && ` ${result.errors.length} erreur${result.errors.length > 1 ? 's' : ''} à corriger.`}
                  </p>
                </div>
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-sm font-semibold text-amber-950">Lignes ignorées</h3>
                <ul className="mt-2 space-y-1 text-sm text-amber-900">
                  {result.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-rose-950">Erreurs à corriger</h3>
                    <p className="mt-1 text-sm text-rose-900">
                      Les lignes suivantes n&apos;ont pas été importées. Corrigez-les dans votre fichier puis relancez l&apos;import.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {result.errors.map((error: CsvImportError, index) => (
                        <li
                          key={`${error.row}-${error.field}-${index}`}
                          className="rounded-lg bg-white px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-100"
                        >
                          <span className="font-semibold">Ligne {error.row}</span>
                          {error.field && <span className="mx-2 text-rose-400">•</span>}
                          <span className="font-medium">{error.field}</span>
                          <span className="mx-2 text-rose-400">•</span>
                          <span>{error.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Fermer
          </button>
          <button
            type="submit"
            disabled={!file || isLoading}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Import en cours...' : 'Importer le fichier'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
