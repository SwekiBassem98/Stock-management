'use client';

import { useState } from 'react';
import { addAdjustmentDelta } from '../stock/actions';

type Movement = {
  id: number;
  type: string;
  quantity: string;
  unitPrice: string | null;
  movementDate: Date;
  documentType: string | null;
  documentId: number | null;
  note: string | null;
  variant: {
    id: number;
    internalRef: string | null;
    supplierRef: string | null;
    material: {
      name: string;
    };
  };
};

type Variant = {
  id: number;
  internalRef: string | null;
  supplierRef: string | null;
  material: {
    name: string;
  };
};

type Props = {
  movements: Movement[];
  variants: Variant[];
};

const typeColors = {
  IN: 'bg-green-100 text-green-800',
  OUT: 'bg-red-100 text-red-800',
  ADJUST: 'bg-blue-100 text-blue-800',
};

export default function MovementsClient({ movements, variants }: Props) {
  const [isAddAdjustmentModalOpen, setIsAddAdjustmentModalOpen] = useState(false);

  const handleAddAdjustment = async (formData: FormData) => {
    await addAdjustmentDelta(formData);
    setIsAddAdjustmentModalOpen(false);
  };

  const getMovementTypeStats = () => {
    const stats = { IN: 0, OUT: 0, ADJUST: 0 };
    movements.forEach(m => {
      if (stats.hasOwnProperty(m.type)) {
        stats[m.type as keyof typeof stats]++;
      }
    });
    return stats;
  };

  const stats = getMovementTypeStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mouvements de Stock</h1>
          <p className="text-gray-600 mt-1">Suivez tous les mouvements et ajustements d'inventaire (200 derniers)</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAddAdjustmentModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajustement Manuel
          </button>
          <div className="text-sm text-gray-500">
            {movements.length} mouvements
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mouvements</p>
              <p className="text-2xl font-bold text-gray-900">{movements.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entrées</p>
              <p className="text-2xl font-bold text-green-600">{stats.IN}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sorties</p>
              <p className="text-2xl font-bold text-red-600">{stats.OUT}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ajustements</p>
              <p className="text-2xl font-bold text-blue-600">{stats.ADJUST}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mouvements Récents</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Heure</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Variante</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Quantité</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Prix Unitaire</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Document</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {new Date(movement.movementDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        {new Date(movement.movementDate).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{movement.variant.material.name}</div>
                    <div className="text-sm text-gray-500">
                      {movement.variant.internalRef || movement.variant.supplierRef || `ID: ${movement.variant.id}`}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      typeColors[movement.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {movement.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      movement.type === 'IN' ? 'text-green-600' : 
                      movement.type === 'OUT' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {movement.type === 'OUT' ? '-' : movement.type === 'IN' ? '+' : '±'}{movement.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {movement.unitPrice ? `${Number(movement.unitPrice).toFixed(2)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {movement.documentType && (
                      <div className="text-sm">
                        <div>{movement.documentType}</div>
                        {movement.documentId && (
                          <div className="text-gray-500">#{movement.documentId}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {movement.note || '-'}
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pas encore de mouvement</h3>
                    <p className="text-gray-600">Les mouvements seront affichés ici lorsque le stock change.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Adjustment Modal */}
      {isAddAdjustmentModalOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajustement Manuelle du Stock</h3>
              <button
                onClick={() => setIsAddAdjustmentModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleAddAdjustment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variante</label>
                <select
                  name="variantId"
                  required
                  defaultValue=""
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="" disabled>Selectionner une variante</option>
                  {variants.map(variant => (
                    <option key={variant.id} value={variant.id}>
                      {variant.material.name} — {variant.internalRef || variant.supplierRef || `ID: ${variant.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Changement de quantité</label>
                <input
                  name="delta"
                  type="number"
                  step="0.0001"
                  required
                  placeholder="e.g., +10 or -5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Utilisez des nombres positifs pour ajouter du stock, négatifs pour supprimer du stock
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddAdjustmentModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
