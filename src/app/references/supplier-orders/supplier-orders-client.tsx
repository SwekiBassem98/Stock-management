'use client';

import { useState } from 'react';
import { createSupplierOrder, updateSupplierOrderStatus, deleteSupplierOrder } from './actions';

type Supplier = {
  id: number;
  name: string;
};

type SupplierOrder = {
  id: number;
  orderDate: Date;
  requestedDeliveryDate: Date | null;
  shippingMethod: string | null;
  status: string;
  supplier: Supplier;
  _count: {
    lines: number;
    reminders: number;
  };
};

type Props = {
  orders: SupplierOrder[];
  suppliers: Supplier[];
};

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  PARTIALLY_RECEIVED: 'bg-yellow-100 text-yellow-800',
  RECEIVED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  CONFIRMED: 'Confirmé',
  PARTIALLY_RECEIVED: 'Partiellement Reçu',
  RECEIVED: 'Reçu',
  CANCELLED: 'Annulé',
};

export default function SupplierOrdersClient({ orders, suppliers }: Props) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SupplierOrder | null>(null);

  const handleCreateSubmit = async (formData: FormData) => {
    await createSupplierOrder(formData);
    setIsCreateModalOpen(false);
  };

  const handleStatusUpdate = async (formData: FormData) => {
    await updateSupplierOrderStatus(formData);
    setEditingOrder(null);
  };

  const handleDelete = async (formData: FormData) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      await deleteSupplierOrder(formData);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commandes Fournisseurs</h1>
          <p className="text-gray-600 mt-1">Gérez les commandes des fournisseurs avec suivi et mises à jour de statut</p>
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
            {orders.length} {orders.length === 1 ? 'commande' : 'commandes'}
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
          Ajouter Nouvelle Commande
        </button>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Commande</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fournisseur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date Commande</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date Livraison</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Lignes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Rappels</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">#{order.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{order.supplier.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.requestedDeliveryDate 
                        ? new Date(order.requestedDeliveryDate).toLocaleDateString() 
                        : 'Non défini'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setEditingOrder(order)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                        } hover:opacity-80 transition-opacity`}
                      >
                        {statusLabels[order.status] || order.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{order._count.lines}</td>
                    <td className="py-3 px-4 text-gray-600">{order._count.reminders}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/references/supplier-orders/${order.id}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={order.id} />
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
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600">Get started by creating your first supplier order.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium">Order #{order.id}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{order.supplier.name}</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Order Date</span>
                      <span className="text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Delivery Date</span>
                      <span className="text-gray-900">
                        {order.requestedDeliveryDate 
                          ? new Date(order.requestedDeliveryDate).toLocaleDateString() 
                          : 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Lines</span>
                      <span className="text-blue-600 font-medium">{order._count.lines}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Reminders</span>
                      <span className="text-orange-600 font-medium">{order._count.reminders}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setEditingOrder(order)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                    } hover:opacity-80 transition-opacity`}
                  >
                    {statusLabels[order.status] || order.status}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={`/references/supplier-orders/${order.id}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </a>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={order.id} />
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
          {orders.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Get started by creating your first supplier order.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Créer Nouvelle Commande</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
                <select
                  name="supplierId"
                  required
                  defaultValue=""
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="" disabled>Sélectionnez un fournisseur</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de Commande</label>
                <input
                  type="date"
                  name="orderDate"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de Livraison Demandée</label>
                <input
                  type="date"
                  name="requestedDeliveryDate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Méthode d'Expédition</label>
                <input
                  name="shippingMethod"
                  placeholder="ex: Livraison standard, Livraison express"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Créer Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Mettre à Jour le Statut de la Commande</h3>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleStatusUpdate} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editingOrder.id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commande</label>
                <div className="text-gray-900 font-medium">#{editingOrder.id} - {editingOrder.supplier.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  name="status"
                  defaultValue={editingOrder.status}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="SENT">Envoyé</option>
                  <option value="CONFIRMED">Confirmé</option>
                  <option value="PARTIALLY_RECEIVED">Partiellement Reçu</option>
                  <option value="RECEIVED">Reçu</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Mettre à Jour le Statut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
