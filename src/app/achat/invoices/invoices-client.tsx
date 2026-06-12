'use client';

import { useState } from 'react';
import { createInvoice, deleteInvoice } from './actions';

type Supplier = {
  id: number;
  name: string;
};

type Invoice = {
  id: number;
  number: string;
  date: Date;
  totalTTC: string;
  status: string;
  supplier: Supplier;
  _count: {
    lines: number;
  };
};

type Variant = {
  id: number;
  label: string;
};

type Props = {
  invoices: Invoice[];
  suppliers: Supplier[];
  variants: Variant[];
};

type InvoiceLine = {
  variantId: number;
  quantity: number;
  unitPurchasePrice: number;
};

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function InvoicesClient({ invoices, suppliers, variants }: Props) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lines, setLines] = useState<InvoiceLine[]>([]);

  const handleCreateSubmit = async (formData: FormData) => {
    formData.set('lines', JSON.stringify(lines));
    await createInvoice(formData);
    setIsCreateModalOpen(false);
    setLines([]);
  };

  const handleDelete = async (formData: FormData) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      await deleteInvoice(formData);
    }
  };

  const addLine = () => {
    setLines([...lines, { variantId: variants[0]?.id ?? 0, quantity: 1, unitPurchasePrice: 0 }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof InvoiceLine, value: number) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const getTotalAmount = () => {
    return invoices.reduce((sum, inv) => sum + Number(inv.totalTTC), 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factures Fournisseurs</h1>
          <p className="text-gray-600 mt-1">Gérez les factures d'achat et suivez les paiements</p>
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
            {invoices.length} factures • {getTotalAmount().toFixed(2)} total
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Créer Facture
        </button>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Facture</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fournisseur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Numéro</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Lignes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">#{invoice.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{invoice.supplier.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{invoice.number}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{invoice._count.lines}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {Number(invoice.totalTTC).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[invoice.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/achat/invoices/${invoice.id}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={invoice.id} />
                          <button
                            type="submit"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture pour le moment</h3>
                      <p className="text-gray-600">Commencez par créer votre première facture fournisseur.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium">Invoice #{invoice.id}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{invoice.number}</h3>
                      <p className="text-sm text-gray-600">{invoice.supplier.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Date</span>
                      <span className="text-gray-900">{new Date(invoice.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Lines</span>
                      <span className="text-blue-600 font-medium">{invoice._count.lines}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-500 font-medium block">Total Amount</span>
                      <span className="text-lg font-bold text-green-600">{Number(invoice.totalTTC).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[invoice.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={`/achat/invoices/${invoice.id}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </a>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={invoice.id} />
                    <button
                      type="submit"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture pour le moment</h3>
              <p className="text-gray-600">Commencez par créer votre première facture fournisseur.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Nouvelle Facture</h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setLines([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleCreateSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <select
                    name="supplierId"
                    required
                    defaultValue=""
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="" disabled>Sélectionner un fournisseur</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de facture</label>
                  <input
                    name="number"
                    required
                    placeholder="e.g., INV-2024-001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Lines Builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">Lignes de facture</h4>
                  <button
                    type="button"
                    onClick={addLine}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ajouter une ligne
                  </button>
                </div>
                
                {lines.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    Aucune ligne ajoutée. Cliquez sur "Ajouter une ligne" pour commencer.
                  </div>
                )}
                
                {lines.map((line, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Variante</label>
                      <select
                        value={line.variantId}
                        onChange={(e) => updateLine(index, 'variantId', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {variants.map(variant => (
                          <option key={variant.id} value={variant.id}>{variant.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(index, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire</label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={line.unitPurchasePrice}
                        onChange={(e) => updateLine(index, 'unitPurchasePrice', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-700">
                        Totale: {(line.quantity * line.unitPurchasePrice).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                {lines.length > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      Facture Totale: {lines.reduce((sum, line) => sum + (line.quantity * line.unitPurchasePrice), 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setLines([]);
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={lines.length === 0}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer la facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
