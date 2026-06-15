'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMaterial, updateMaterial, deleteMaterial, importCsvMaterials } from './actions';
import Modal from '@/components/ui/modal';
import ViewToggle from '@/components/ui/view-toggle';
import CsvImportModal from '../csv-import-modal';

interface MaterialsClientProps {
  materials: any[];
  categories: any[];
}

function MaterialCard({ material, onEdit, onDelete }: { material: any, onEdit: (material: any) => void, onDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">ID #{material.id}</span>
              <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-gray-500 font-medium">Unité</span>
              <p className="text-sm text-gray-900">{material.unit}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Catégorie</span>
              <p className="text-sm text-gray-900">{material.category.name}</p>
            </div>
            {material.packaging && (
              <div>
                <span className="text-xs text-gray-500 font-medium">Emballage</span>
                <p className="text-sm text-gray-900">{material.packaging}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-500 font-medium">Variantes</span>
              <p className="text-sm text-gray-900">{material._count.variants} variantes</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(material)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(material.id)}
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

function MaterialsTable({ materials, onEdit, onDelete }: { materials: any[], onEdit: (material: any) => void, onDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unité</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variantes</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {materials.map((material) => (
            <tr key={material.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{material.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{material.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.unit}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.category.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material._count.variants} variantes</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(material)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(material.id)}
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

export default function MaterialsClient({ materials, categories }: MaterialsClientProps) {
  const router = useRouter();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce matériau ?')) {
      const formData = new FormData();
      formData.append('id', id.toString());
      await deleteMaterial(formData);
      router.refresh();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createMaterial(formData);
    setIsAddModalOpen(false);
    router.refresh();
  };

  const handleImportComplete = () => {
    setIsImportModalOpen(false);
    router.refresh();
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateMaterial(formData);
    setIsEditModalOpen(false);
    setEditingMaterial(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matériaux</h1>
          <p className="text-gray-600 mt-1">Gérez vos matériaux et leurs propriétés</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {materials.length} {materials.length === 1 ? 'matériau' : 'matériaux'}
          </span>
          <ViewToggle view={view} onViewChange={setView} />
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
            Ajouter Matériau
          </button>
        </div>
      </div>

      {/* Content */}
      {materials.length > 0 ? (
        view === 'table' ? (
          <MaterialsTable materials={materials} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun matériau pour le moment</h3>
          <p className="text-gray-600 mb-4">Commencez par créer votre premier matériau.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
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
              Ajouter Matériau
            </button>
          </div>
        </div>
      )}

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importer des Matériaux"
        entityType="matériaux"
        requiredColumns={['name / nom', 'unit / unité', 'category / catégorie / categoryid']}
        sampleRows={['name,unit,category', 'Acier,kg,Métaux', 'PVC,m,Bâtiment']}
        importAction={importCsvMaterials}
        onComplete={handleImportComplete}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter Nouveau Matériau"
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du Matériau
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Entrez le nom du matériau"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                Unité de Mesure
              </label>
              <input
                id="unit"
                name="unit"
                type="text"
                placeholder="ex: m, m2, kg"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="packaging" className="block text-sm font-medium text-gray-700 mb-2">
                Emballage (Optionnel)
              </label>
              <input
                id="packaging"
                name="packaging"
                type="text"
                placeholder="Entrez les informations d'emballage"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                defaultValue=""
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                <option value="" disabled>Sélectionnez une catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="initialQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantité Initiale (Optionnel)
              </label>
              <input
                id="initialQuantity"
                name="initialQuantity"
                type="number"
                step="1"
                min="0"
                placeholder="0"
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
              Ajouter Matériau
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMaterial(null);
        }}
        title="Modifier Matériau"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingMaterial?.id} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du Matériau
              </label>
              <input
                id="edit-name"
                name="name"
                type="text"
                defaultValue={editingMaterial?.name}
                placeholder="Entrez le nom du matériau"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-unit" className="block text-sm font-medium text-gray-700 mb-2">
                Unité de Mesure
              </label>
              <input
                id="edit-unit"
                name="unit"
                type="text"
                defaultValue={editingMaterial?.unit}
                placeholder="ex: m, m2, kg"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-packaging" className="block text-sm font-medium text-gray-700 mb-2">
                Emballage (Optionnel)
              </label>
              <input
                id="edit-packaging"
                name="packaging"
                type="text"
                defaultValue={editingMaterial?.packaging || ''}
                placeholder="Entrez les informations d'emballage"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="edit-categoryId"
                name="categoryId"
                defaultValue={editingMaterial?.categoryId}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingMaterial(null);
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
