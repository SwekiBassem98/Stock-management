'use client';

import { useState } from 'react';
import { adjustStockToQuantity } from './actions';

type Stock = {
  id: number;
  currentQty: string;
  variantId: number;
  variant: {
    id: number;
    internalRef: string | null;
    supplierRef: string | null;
    minAlert: string;
    material: {
      name: string;
    };
  };
};

type Props = {
  stocks: Stock[];
};

export default function StockClient({ stocks }: Props) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingStock, setEditingStock] = useState<Stock | null>(null);

  const handleAdjustStock = async (formData: FormData) => {
    await adjustStockToQuantity(formData);
    setEditingStock(null);
  };

  const getLowStockCount = () => {
    return stocks.filter(s => {
      const qty = Number(s.currentQty);
      const min = Number(s.variant.minAlert);
      return min > 0 && qty < min;
    }).length;
  };

  const getStockStatus = (stock: Stock) => {
    const qty = Number(stock.currentQty);
    const min = Number(stock.variant.minAlert);
    
    if (min > 0 && qty < min) return 'low';
    if (qty === 0) return 'out';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'out': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'low': return 'Stock Faible';
      case 'out': return 'Rupture de Stock';
      default: return 'En Stock';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Niveaux de Stock</h1>
          <p className="text-gray-600 mt-1">Surveillez et ajustez les quantités d'inventaire</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tableau
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grille
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {stocks.length} variantes • {getLowStockCount()} stock faible
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Variantes</p>
              <p className="text-2xl font-bold text-gray-900">{stocks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Faible</p>
              <p className="text-2xl font-bold text-yellow-600">{getLowStockCount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rupture de Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {stocks.filter(s => Number(s.currentQty) === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Variante</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Quantité Actuelle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Alerte Min</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stocks.map((stock) => {
                  const status = getStockStatus(stock);
                  const qty = Number(stock.currentQty);
                  const min = Number(stock.variant.minAlert);
                  
                  return (
                    <tr key={stock.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{stock.variant.material.name}</div>
                        <div className="text-sm text-gray-500">
                          {stock.variant.internalRef || stock.variant.supplierRef || `ID: ${stock.variant.id}`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${status === 'out' ? 'text-red-600' : status === 'low' ? 'text-yellow-600' : 'text-gray-900'}`}>
                          {qty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {min > 0 ? min : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setEditingStock(stock)}
                          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                          Ajuster
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {stocks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enregistrement de stock</h3>
                      <p className="text-gray-600">Les niveaux de stock apparaîtront ici une fois que vous recevrez l'inventaire.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((stock) => {
            const status = getStockStatus(stock);
            const qty = Number(stock.currentQty);
            const min = Number(stock.variant.minAlert);
            
            return (
              <div key={stock.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        status === 'out' ? 'bg-red-100' : status === 'low' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          status === 'out' ? 'text-red-600' : status === 'low' ? 'text-yellow-600' : 'text-green-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{stock.variant.material.name}</h3>
                        <p className="text-sm text-gray-500">
                          {stock.variant.internalRef || stock.variant.supplierRef || `ID: ${stock.variant.id}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-xs text-gray-500 font-medium block">Current Qty</span>
                        <span className={`text-lg font-bold ${
                          status === 'out' ? 'text-red-600' : status === 'low' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {qty}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 font-medium block">Min Alert</span>
                        <span className="text-gray-900 font-medium">{min > 0 ? min : '-'}</span>
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setEditingStock(stock)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
          {stocks.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enregistrement de stock</h3>
              <p className="text-gray-600">Les niveaux de stock apparaîtront ici une fois que vous recevrez l'inventaire.</p>
            </div>
          )}
        </div>
      )}

      {/* Adjust Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajuster le Niveau de Stock</h3>
              <button
                onClick={() => setEditingStock(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleAdjustStock} className="p-6 space-y-4">
              <input type="hidden" name="variantId" value={editingStock.variantId} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variante</label>
                <div className="text-gray-900 font-medium">
                  {editingStock.variant.material.name}
                </div>
                <div className="text-sm text-gray-500">
                  {editingStock.variant.internalRef || editingStock.variant.supplierRef || `ID: ${editingStock.variant.id}`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Quantité Actuelle:</span>
                  <div className="font-medium">{editingStock.currentQty}</div>
                </div>
                <div>
                  <span className="text-gray-500">Niveau d'Alerte Min:</span>
                  <div className="font-medium">{Number(editingStock.variant.minAlert) > 0 ? editingStock.variant.minAlert : '-'}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouvelle Quantité</label>
                <input
                  name="newQty"
                  type="number"
                  step="0.0001"
                  min="0"
                  defaultValue={editingStock.currentQty}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStock(null)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Mettre à Jour le Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
