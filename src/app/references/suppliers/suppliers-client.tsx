'use client';

import { useState } from 'react';
import { createSupplier, updateSupplier, deleteSupplier } from './actions';
import Modal from '@/components/ui/modal';
import ViewToggle from '@/components/ui/view-toggle';

interface SuppliersClientProps {
  suppliers: any[];
}

function SupplierCard({ supplier, onEdit, onDelete }: { supplier: any, onEdit: (supplier: any) => void, onDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">ID #{supplier.id}</span>
              <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            {supplier.address && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-600">{supplier.address}</span>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-500 font-medium block">Solde</span>
                <span className={`font-medium ${Number(supplier.currentBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(supplier.currentBalance).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium block">Commandes</span>
                <span className="text-gray-900">{supplier._count.orders}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium block">Factures</span>
                <span className="text-gray-900">{supplier._count.invoices}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(supplier)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(supplier.id)}
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

function SuppliersTable({ suppliers, onEdit, onDelete }: { suppliers: any[], onEdit: (supplier: any) => void, onDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solde</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commandes</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{supplier.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{supplier.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                {supplier.address || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`font-medium ${Number(supplier.currentBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(supplier.currentBalance).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier._count.orders}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(supplier)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(supplier.id)}
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

export default function SuppliersClient({ suppliers }: SuppliersClientProps) {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      const formData = new FormData();
      formData.append('id', id.toString());
      await deleteSupplier(formData);
      window.location.reload();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createSupplier(formData);
    setIsAddModalOpen(false);
    window.location.reload();
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateSupplier(formData);
    setIsEditModalOpen(false);
    setEditingSupplier(null);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-600 mt-1">Gérez vos relations fournisseurs et leurs soldes</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {suppliers.length} {suppliers.length === 1 ? 'fournisseur' : 'fournisseurs'}
          </span>
          <ViewToggle view={view} onViewChange={setView} />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter Fournisseur
          </button>
        </div>
      </div>

      {/* Content */}
      {suppliers.length > 0 ? (
        view === 'table' ? (
          <SuppliersTable suppliers={suppliers} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fournisseur pour le moment</h3>
          <p className="text-gray-600 mb-4">Commencez par ajouter votre premier fournisseur.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter Fournisseur
          </button>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter Nouveau Fournisseur"
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du Fournisseur
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Entrez le nom du fournisseur"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse (Optionnel)
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Entrez l'adresse du fournisseur"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
            <div>
              <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700 mb-2">
                Solde Initial
              </label>
              <input
                id="currentBalance"
                name="currentBalance"
                type="number"
                step="0.01"
                placeholder="0.00"
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
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Add Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSupplier(null);
        }}
        title="Modifier Fournisseur"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingSupplier?.id} />
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du Fournisseur
              </label>
              <input
                id="edit-name"
                name="name"
                type="text"
                defaultValue={editingSupplier?.name}
                placeholder="Entrez le nom du fournisseur"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse (Optionnel)
              </label>
              <textarea
                id="edit-address"
                name="address"
                rows={3}
                defaultValue={editingSupplier?.address || ''}
                placeholder="Entrez l'adresse du fournisseur"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
            <div>
              <label htmlFor="edit-currentBalance" className="block text-sm font-medium text-gray-700 mb-2">
                Solde Initial
              </label>
              <input
                id="edit-currentBalance"
                name="currentBalance"
                type="number"
                step="0.01"
                defaultValue={editingSupplier?.currentBalance}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingSupplier(null);
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
