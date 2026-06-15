'use client';

import { useState } from 'react';
import { createVariant, updateVariant, deleteVariant, importCsvVariants } from './actions';
import Modal from '@/components/ui/modal';
import ViewToggle from '@/components/ui/view-toggle';
import CsvImportModal from '../csv-import-modal';

interface VariantsClientProps {
  variants: any[];
  materials: any[];
}

function VariantCard({ variant, onEdit, onDelete }: { variant: any, onEdit: (variant: any) => void, onDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">ID #{variant.id}</span>
              <h3 className="text-lg font-semibold text-gray-900">{variant.material.name}</h3>
              <p className="text-sm text-gray-600">{variant.material.category.name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            {variant.internalRef && (
              <div>
                <span className="text-xs text-gray-500 font-medium block">Réf Interne</span>
                <span className="text-gray-900">{variant.internalRef}</span>
              </div>
            )}
            {variant.supplierRef && (
              <div>
                <span className="text-xs text-gray-500 font-medium block">Réf Fournisseur</span>
                <span className="text-gray-900">{variant.supplierRef}</span>
              </div>
            )}
            {variant.color && (
              <div>
                <span className="text-xs text-gray-500 font-medium block">Couleur</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-gray-300" style={{backgroundColor: variant.color.toLowerCase()}}></div>
                  <span className="text-gray-900">{variant.color}</span>
                </div>
              </div>
            )}
            {variant.thickness && (
              <div>
                <span className="text-xs text-gray-500 font-medium block">Épaisseur</span>
                <span className="text-gray-900">{variant.thickness}</span>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-500 font-medium block">Prix Moyen</span>
              <span className="text-green-600 font-medium">{Number(variant.avgUnitPrice).toFixed(4)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Alerte Min</span>
              <span className="text-orange-600 font-medium">{Number(variant.minAlert).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(variant)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(variant.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function VariantsTable({ variants, onEdit, onDelete }: { variants: any[], onEdit: (variant: any) => void, onDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matériau</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réf Interne</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Couleur</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {variants.map((variant) => (
            <tr key={variant.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{variant.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{variant.material.name}</div>
                    <div className="text-xs text-gray-500">{variant.material.category.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{variant.internalRef || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {variant.color ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-gray-300" style={{backgroundColor: variant.color.toLowerCase()}}></div>
                    <span>{variant.color}</span>
                  </div>
                ) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                {Number(variant.avgUnitPrice).toFixed(4)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(variant)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(variant.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VariantsClient({ variants, materials }: VariantsClientProps) {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);

  const handleEdit = (variant: any) => {
    setEditingVariant(variant);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette variante ?')) {
      const formData = new FormData();
      formData.append('id', id.toString());
      await deleteVariant(formData);
      window.location.reload();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createVariant(formData);
    setIsAddModalOpen(false);
    window.location.reload();
  };

  const handleImportComplete = () => {
    setIsImportModalOpen(false);
    window.location.reload();
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateVariant(formData);
    setIsEditModalOpen(false);
    setEditingVariant(null);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Variantes</h1>
          <p className="text-gray-600 mt-1">Gérez les variantes de matériaux avec des propriétés et prix spécifiques</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {variants.length} {variants.length === 1 ? 'variante' : 'variantes'}
          </span>
          <ViewToggle view={view} onViewChange={setView} />
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-orange-700 font-medium rounded-lg border border-orange-200 hover:bg-orange-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importer CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter Variante
          </button>
        </div>
      </div>

      {/* Content */}
      {variants.length > 0 ? (
        view === 'table' ? (
          <VariantsTable variants={variants} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune variante pour le moment</h3>
          <p className="text-gray-600 mb-4">Commencez par créer votre première variante.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-700 font-medium rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importer CSV
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter Variante
            </button>
          </div>
        </div>
      )}

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importer des Variantes"
        entityType="variantes"
        requiredColumns={['material / matériau / materialid', 'avgUnitPrice', 'minAlert', 'initialQuantity']}
        sampleRows={['material,avgUnitPrice,minAlert,initialQuantity', 'Acier,12.50,10,100', 'PVC,8.25,20,50']}
        importAction={importCsvVariants}
        onComplete={handleImportComplete}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter Nouvelle Variante"
        size="xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="materialId" className="block text-sm font-medium text-gray-700 mb-2">
                Matériau
              </label>
              <select
                id="materialId"
                name="materialId"
                required
                defaultValue=""
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                <option value="" disabled>Sélectionnez un matériau</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="internalRef" className="block text-sm font-medium text-gray-700 mb-2">
                Référence Interne (Optionnel)
              </label>
              <input
                id="internalRef"
                name="internalRef"
                type="text"
                placeholder="Entrez la référence interne"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="supplierRef" className="block text-sm font-medium text-gray-700 mb-2">
                Référence Fournisseur (Optionnel)
              </label>
              <input
                id="supplierRef"
                name="supplierRef"
                type="text"
                placeholder="Entrez la référence fournisseur"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                Couleur (Optionnel)
              </label>
              <input
                id="color"
                name="color"
                type="text"
                placeholder="Entrez la couleur"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="thickness" className="block text-sm font-medium text-gray-700 mb-2">
                Épaisseur (Optionnel)
              </label>
              <input
                id="thickness"
                name="thickness"
                type="text"
                placeholder="ex: 18mm"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="avgUnitPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Prix Unitaire Moyen
              </label>
              <input
                id="avgUnitPrice"
                name="avgUnitPrice"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                defaultValue="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="minAlert" className="block text-sm font-medium text-gray-700 mb-2">
                Seuil d'Alerte Minimum
              </label>
              <input
                id="minAlert"
                name="minAlert"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                defaultValue="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="initialQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantité Initiale
              </label>
              <input
                id="initialQuantity"
                name="initialQuantity"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                defaultValue="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Ajouter Variante
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingVariant(null);
        }}
        title="Modifier Variante"
        size="xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingVariant?.id} />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="edit-materialId" className="block text-sm font-medium text-gray-700 mb-2">
                Matériau
              </label>
              <select
                id="edit-materialId"
                name="materialId"
                defaultValue={editingVariant?.materialId}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-internalRef" className="block text-sm font-medium text-gray-700 mb-2">
                Référence Interne (Optionnel)
              </label>
              <input
                id="edit-internalRef"
                name="internalRef"
                type="text"
                defaultValue={editingVariant?.internalRef || ''}
                placeholder="Entrez la référence interne"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-supplierRef" className="block text-sm font-medium text-gray-700 mb-2">
                Référence Fournisseur (Optionnel)
              </label>
              <input
                id="edit-supplierRef"
                name="supplierRef"
                type="text"
                defaultValue={editingVariant?.supplierRef || ''}
                placeholder="Entrez la référence fournisseur"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-color" className="block text-sm font-medium text-gray-700 mb-2">
                Couleur (Optionnel)
              </label>
              <input
                id="edit-color"
                name="color"
                type="text"
                defaultValue={editingVariant?.color || ''}
                placeholder="Entrez la couleur"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-thickness" className="block text-sm font-medium text-gray-700 mb-2">
                Épaisseur (Optionnel)
              </label>
              <input
                id="edit-thickness"
                name="thickness"
                type="text"
                defaultValue={editingVariant?.thickness || ''}
                placeholder="ex: 18mm"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-avgUnitPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Prix Unitaire Moyen
              </label>
              <input
                id="edit-avgUnitPrice"
                name="avgUnitPrice"
                type="number"
                step="0.0001"
                min="0"
                defaultValue={editingVariant?.avgUnitPrice}
                placeholder="0.0000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-minAlert" className="block text-sm font-medium text-gray-700 mb-2">
                Seuil d'Alerte Minimum
              </label>
              <input
                id="edit-minAlert"
                name="minAlert"
                type="number"
                step="0.0001"
                min="0"
                defaultValue={editingVariant?.minAlert}
                placeholder="0.0000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-initialQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantité Initiale
              </label>
              <input
                id="edit-initialQuantity"
                name="initialQuantity"
                type="number"
                step="0.0001"
                min="0"
                defaultValue={editingVariant?.initialQuantity || '0'}
                placeholder="0.0000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingVariant(null);
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Enregistrer les Modifications
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
