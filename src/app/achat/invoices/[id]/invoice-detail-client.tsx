'use client';

import { useState } from 'react';
import { addInvoiceLine, createMaterialFromInvoice, createVariantFromInvoice, deleteInvoiceLine, deleteInvoice } from '../actions';
import { downloadSimpleInvoicePDF } from '../../../utils/simplePdfGenerator';
import { downloadInvoicePDF } from '../../../utils/pdfGenerator';
import { useRouter } from 'next/navigation';

type Variant = {
  id: number;
  internalRef: string | null;
  supplierRef: string | null;
  material: {
    name: string;
  };
};

type InvoiceLine = {
  id: number;
  quantity: string;
  unitPurchasePrice: string;
  variant: Variant;
};

type Invoice = {
  id: number;
  number: string;
  date: Date;
  totalTTC: string;
  status: string;
  supplier: {
    name: string;
  };
  lines: InvoiceLine[];
};

type Category = {
  id: number;
  name: string;
};

type Props = {
  invoice: Invoice;
  variants: Variant[];
  categories: Category[];
};

export default function InvoiceDetailClient({ invoice, variants, categories }: Props) {
  const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);
  const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState(false);
  const [isCreateVariantModalOpen, setIsCreateVariantModalOpen] = useState(false);
  const [newlyCreatedMaterialId, setNewlyCreatedMaterialId] = useState<number | null>(null);
  const [newlyCreatedVariantId, setNewlyCreatedVariantId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleAddLine = async (formData: FormData) => {
    await addInvoiceLine(formData);
    setIsAddLineModalOpen(false);
    router.refresh();
  };

  const handleOpenCreateMaterial = () => {
    setIsCreateMaterialModalOpen(true);
  };

  const handleCreateMaterial = async (formData: FormData) => {
    setIsCreating(true);
    try {
      const materialId = await createMaterialFromInvoice(formData);
      setNewlyCreatedMaterialId(materialId);
      setIsCreateMaterialModalOpen(false);
      setIsCreateVariantModalOpen(true);
      router.refresh();
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Erreur lors de la création du matériau');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateVariant = async (formData: FormData) => {
    setIsCreating(true);
    try {
      const variantId = await createVariantFromInvoice(formData);
      setNewlyCreatedVariantId(variantId);
      setIsCreateVariantModalOpen(false);
      router.refresh();
      // The newly created variant will now be available in the dropdown
    } catch (error) {
      console.error('Error creating variant:', error);
      alert('Erreur lors de la création de la variante');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLine = async (formData: FormData) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
      await deleteInvoiceLine(formData);
      router.refresh();
    }
  };

  const handleDeleteInvoice = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      const formData = new FormData();
      formData.append('id', String(invoice.id));
      await deleteInvoice(formData);
      router.push('/achat/invoices');
    }
  };

  const handleExportPDF = () => {
    try {
      // Try the advanced PDF first, fallback to simple if it fails
      try {
        downloadInvoicePDF(invoice);
      } catch (advancedError) {
        console.warn('Advanced PDF failed, using simple PDF:', advancedError);
        downloadSimpleInvoicePDF(invoice);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const getInvoiceTotal = () => {
    return invoice.lines.reduce((sum, line) => {
      return sum + (Number(line.quantity) * Number(line.unitPurchasePrice));
    }, 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Facture #{invoice.id}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {invoice.status}
            </span>
          </div>
          <div className="text-gray-600">
            <div className="font-medium text-lg">{invoice.number}</div>
            <div className="flex items-center gap-6 mt-1 text-sm">
              <span>{invoice.supplier.name}</span>
              <span>{new Date(invoice.date).toLocaleDateString()}</span>
              <span className="font-medium text-green-600">Total: {Number(invoice.totalTTC).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter PDF
          </button>
          <button
            onClick={handleDeleteInvoice}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer la Facture
          </button>
          <a
            href="/achat/invoices"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux Factures
          </a>
        </div>
      </div>

      {/* Invoice Lines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lignes de Facture</h2>
          <button
            onClick={() => setIsAddLineModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter Ligne
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Variante</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Quantité</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Prix Unitaire</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total Ligne</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.lines.map((line) => {
                const lineTotal = Number(line.quantity) * Number(line.unitPurchasePrice);
                
                return (
                  <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{line.variant.material.name}</div>
                      <div className="text-sm text-gray-500">
                        {line.variant.internalRef || line.variant.supplierRef || `ID: ${line.variant.id}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{Number(line.quantity).toFixed(0)}</td>
                    <td className="py-3 px-4 text-gray-600">{Number(line.unitPurchasePrice).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{lineTotal.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <form action={handleDeleteLine}>
                        <input type="hidden" name="lineId" value={line.id} />
                        <input type="hidden" name="invoiceId" value={invoice.id} />
                        <button
                          type="submit"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {invoice.lines.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune ligne ajoutée</h3>
                    <p className="text-gray-600">Ajoutez des lignes de facture pour enregistrer les articles achetés.</p>
                  </td>
                </tr>
              )}
            </tbody>
            {invoice.lines.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-right font-medium text-gray-900">
                    Total Facture:
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-lg font-bold text-green-600">
                      {getInvoiceTotal().toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lignes</p>
              <p className="text-2xl font-bold text-gray-900">{invoice.lines.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Facture</p>
              <p className="text-2xl font-bold text-green-600">{Number(invoice.totalTTC).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-2m-6 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Statut</p>
              <p className="text-2xl font-bold text-purple-600">{invoice.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Line Modal */}
      {isAddLineModalOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter Ligne de Facture</h3>
              <button
                onClick={() => setIsAddLineModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleAddLine} className="p-6 space-y-4">
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Variante</label>
                  <button
                    type="button"
                    onClick={handleOpenCreateMaterial}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Créer Nouveau Matériau & Variante
                  </button>
                </div>
                <select
                  name="variantId"
                  required
                  defaultValue={newlyCreatedVariantId || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="" disabled>Sélectionnez une variante</option>
                  {variants.map(variant => (
                    <option key={variant.id} value={variant.id}>
                      {variant.material.name} — {variant.internalRef || variant.supplierRef || `ID: ${variant.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                <input
                  name="quantity"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  placeholder="Entrez la quantité"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix d'Achat Unitaire</label>
                <input
                  name="unitPurchasePrice"
                  type="number"
                  step="0.0001"
                  min="0"
                  required
                  placeholder="Entrez le prix unitaire"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddLineModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Ajouter Ligne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Material Modal */}
      {isCreateMaterialModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] transition-all duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Créer Nouveau Matériau</h3>
              <button
                onClick={() => setIsCreateMaterialModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleCreateMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <select
                  name="categoryId"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Matériau *</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Ex: Acier inoxydable"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unité de Mesure *</label>
                <input
                  name="unit"
                  type="text"
                  required
                  placeholder="Ex: kg, m, pcs"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emballage (Optionnel)</label>
                <input
                  name="packaging"
                  type="text"
                  placeholder="Ex: Boîte de 100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateMaterialModalOpen(false)}
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création...
                    </>
                  ) : (
                    'Créer & Ajouter Variante'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Variant Modal */}
      {isCreateVariantModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] transition-all duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Créer Nouvelle Variante</h3>
              <button
                onClick={() => setIsCreateVariantModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleCreateVariant} className="p-6 space-y-4">
              <input type="hidden" name="materialId" value={newlyCreatedMaterialId || ""} />
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-indigo-700">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Créez une variante pour le matériau que vous venez d'ajouter
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Référence Interne</label>
                <input
                  name="internalRef"
                  type="text"
                  placeholder="Ex: MAT-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Référence Fournisseur</label>
                <input
                  name="supplierRef"
                  type="text"
                  placeholder="Ex: SUP-XYZ-123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                  <input
                    name="color"
                    type="text"
                    placeholder="Ex: Rouge"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Épaisseur</label>
                  <input
                    name="thickness"
                    type="text"
                    placeholder="Ex: 2mm"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix Moyen</label>
                  <input
                    name="avgUnitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue="0"
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alerte Min</label>
                  <input
                    name="minAlert"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue="0"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateVariantModalOpen(false)}
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création...
                    </>
                  ) : (
                    'Créer Variante'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
