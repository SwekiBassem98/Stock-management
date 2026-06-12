'use client';

import { useState } from 'react';
import UserModal from '@/app/components/user-modal';
import ConfirmationModal from '@/app/components/confirmation-modal';

type DashboardData = {
  totalCategories: number;
  totalMaterials: number;
  totalVariants: number;
  totalSuppliers: number;
  totalOrders: number;
  totalInvoices: number;
  totalMovements: number;
  totalStockItems: number;
  totalStockQuantity: string;
  recentOrders: any[];
  recentInvoices: any[];
  recentMovements: any[];
  lowStockItems: any[];
  supplierBalances: any[];
  ordersByStatus: any[];
  invoicesByStatus: any[];
  movementsByType: any[];
  users: any[];
};

type Props = {
  data: DashboardData;
};

export default function DashboardClient({ data }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'analytics' | 'users'>('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [users, setUsers] = useState(data.users);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      RECEIVED: 'bg-emerald-100 text-emerald-800',
      PAID: 'bg-green-100 text-green-800',
      OPEN: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMovementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      IN: 'text-green-600',
      OUT: 'text-red-600',
      ADJUST: 'text-blue-600',
    };
    return colors[type] || 'text-gray-600';
  };

  const handleSaveUser = async (userData: any) => {
    setLoading(true);
    try {
      if (editingUser) {
        // Update existing user
        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update user');
        }

        const updatedUser = await response.json();
        setUsers(prev => prev.map(user => user.id === editingUser.id ? updatedUser : user));
      } else {
        // Create new user
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...userData,
            createdBy: 1, // Assuming admin user ID is 1
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create user');
        }

        const newUser = await response.json();
        setUsers(prev => [newUser, ...prev]);
      }

      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error; // Re-throw to be handled by the modal
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Admin</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble complète de votre système de gestion de stock</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {(['overview', 'alerts', 'analytics', 'users'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' ? 'Vue d\'ensemble' : tab === 'alerts' ? 'Alertes' : tab === 'analytics' ? 'Analyses' : 'Utilisateurs'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Produits</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalVariants}</p>
                  <p className="text-xs text-gray-500">{data.totalMaterials} matériaux</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Éléments de Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalStockItems}</p>
                  <p className="text-xs text-gray-500">Quantité totale: {Number(data.totalStockQuantity).toFixed(0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fournisseurs</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalSuppliers}</p>
                  <p className="text-xs text-gray-500">{data.totalOrders} commandes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Factures</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalInvoices}</p>
                  <p className="text-xs text-gray-500">{data.totalMovements} mouvements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Commandes Récentes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {data.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Commande #{order.id}</div>
                        <div className="text-sm text-gray-500">{order.supplier.name}</div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">{order._count.lines} lignes</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <a href="/references/supplier-orders" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Voir toutes les commandes →
                  </a>
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Factures Récentes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {data.recentInvoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{invoice.number}</div>
                        <div className="text-sm text-gray-500">{invoice.supplier.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{Number(invoice.totalTTC).toFixed(2)}</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <a href="/achat/invoices" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Voir toutes les factures →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <>
          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Alertes Stock Faible</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {data.lowStockItems.length} éléments
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Produit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Stock Actuel</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Alerte Min</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.lowStockItems.map((stock) => {
                    const current = Number(stock.currentQty);
                    const minAlert = Number(stock.variant.minAlert);
                    const isOutOfStock = current === 0;
                    
                    return (
                      <tr key={stock.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{stock.variant.material.name}</div>
                          <div className="text-sm text-gray-500">
                            {stock.variant.internalRef || stock.variant.supplierRef || `ID: ${stock.variant.id}`}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'}`}>
                            {current}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{minAlert}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isOutOfStock ? 'Rupture de Stock' : 'Stock Faible'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Balances */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Soldes impayés des fournisseurs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.supplierBalances.map((supplier) => {
                  const balance = Number(supplier.currentBalance);
                  const isPositive = balance > 0;
                  
                  return (
                    <div key={supplier.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-sm text-gray-500">{supplier.address || 'Aucune adresse'}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.abs(balance).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isPositive ? 'Nous devons' : 'Ils nous doivent'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          {/* Status Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders by Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Commandes par statut</h3>
              <div className="space-y-3">
                {data.ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="font-medium text-gray-900">{item._count.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoices by Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Factures par Statut</h3>
              <div className="space-y-3">
                {data.invoicesByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="font-medium text-gray-900">{item._count.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Movements by Type (Last 30 Days) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mouvements (30 Jours)</h3>
              <div className="space-y-3">
                {data.movementsByType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className={`font-medium ${getMovementTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    <span className="font-medium text-gray-900">{item._count.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Movements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Mouvements de Stock Récents</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Produit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Quantité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.recentMovements.slice(0, 10).map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(movement.movementDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{movement.variant.material.name}</div>
                        <div className="text-sm text-gray-500">
                          {movement.variant.internalRef || movement.variant.supplierRef || `ID: ${movement.variant.id}`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getMovementTypeColor(movement.type)}`}>
                          {movement.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getMovementTypeColor(movement.type)}`}>
                          {movement.type === 'OUT' ? '-' : movement.type === 'IN' ? '+' : '±'}{movement.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200">
              <a href="/stock/movements" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                Voir tous les mouvements →
              </a>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {/* Users Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des Utilisateurs</h3>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setShowUserModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter Nouvel Utilisateur
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom d'utilisateur</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Complet</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.fullName || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={loading}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Consultants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(user => user.role === 'CONSULTANT').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(user => user.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        editingUser={editingUser}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        title="Supprimer Utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete?.username}" ? Cette action ne peut pas être annulée et supprimera définitivement l'utilisateur du système.`}
        confirmText="Supprimer Utilisateur"
        cancelText="Annuler"
        icon="delete"
        confirmButtonColor="red"
      />
    </div>
  );
}
