'use client';

import { useState } from 'react';
import { addOrderLine, receiveOnLine, deleteOrderLine, addReminder, deleteReminder } from '../actions';
import { downloadSupplierOrderPDF } from '../../../utils/supplierOrderPdfGenerator';
import { useRouter } from 'next/navigation';

type Variant = {
  id: number;
  internalRef: string | null;
  supplierRef: string | null;
  material: {
    name: string;
  };
};

type OrderLine = {
  id: number;
  quantityOrdered: string;
  quantityReceived: string;
  variant: Variant;
};

type Reminder = {
  id: number;
  reminderDate: Date;
  contactType: string;
  subject: string | null;
  result: string | null;
};

type Order = {
  id: number;
  status: string;
  orderDate: Date;
  requestedDeliveryDate: Date | null;
  shippingMethod: string | null;
  supplier: {
    name: string;
  };
  lines: OrderLine[];
  reminders: Reminder[];
};

type Props = {
  order: Order;
  variants: Variant[];
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

export default function SupplierOrderDetailClient({ order, variants }: Props) {
  const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false);
  const [receivingLine, setReceivingLine] = useState<OrderLine | null>(null);
  const router = useRouter();

  const handleAddLine = async (formData: FormData) => {
    await addOrderLine(formData);
    setIsAddLineModalOpen(false);
  };

  const handleReceive = async (formData: FormData) => {
    await receiveOnLine(formData);
    setReceivingLine(null);
  };

  const handleAddReminder = async (formData: FormData) => {
    await addReminder(formData);
    setIsAddReminderModalOpen(false);
  };

  const handleDeleteLine = async (formData: FormData) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
      await deleteOrderLine(formData);
    }
  };

  const handleDeleteReminder = async (formData: FormData) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rappel ?')) {
      await deleteReminder(formData);
    }
  };

  const handleExportPDF = async () => {
    await downloadSupplierOrderPDF(order);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Commande #{order.id}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
            }`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <p className="text-gray-600">{order.supplier.name}</p>
          <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
            <span>Date Commande: {new Date(order.orderDate).toLocaleDateString()}</span>
            {order.requestedDeliveryDate && (
              <span>Livraison: {new Date(order.requestedDeliveryDate).toLocaleDateString()}</span>
            )}
            {order.shippingMethod && <span>Expédition: {order.shippingMethod}</span>}
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
          <a
            href="/references/supplier-orders"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux Commandes
          </a>
        </div>
      </div>

      {/* Order Lines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lignes de Commande</h2>
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
                <th className="text-left py-3 px-4 font-medium text-gray-900">Commandé</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Reçu</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.lines.map((line) => {
                const ordered = Number(line.quantityOrdered);
                const received = Number(line.quantityReceived);
                const remaining = Math.max(0, ordered - received);
                const isComplete = remaining === 0;
                
                return (
                  <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{line.variant.material.name}</div>
                      <div className="text-sm text-gray-500">
                        {line.variant.internalRef || line.variant.supplierRef || `ID: ${line.variant.id}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{ordered}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-gray-900'}`}>
                        {received}
                      </span>
                      {isComplete && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Complet
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {!isComplete && (
                          <button
                            onClick={() => setReceivingLine(line)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Recevoir
                          </button>
                        )}
                        <form action={handleDeleteLine}>
                          <input type="hidden" name="lineId" value={line.id} />
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
                );
              })}
              {order.lines.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="text-gray-500">Aucune ligne ajoutée pour le moment</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Rappels</h2>
          <button
            onClick={() => setIsAddReminderModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter Rappel
          </button>
        </div>
        
        <div className="p-6">
          {order.reminders.length > 0 ? (
            <div className="space-y-3">
              {order.reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-900">
                        {new Date(reminder.reminderDate).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {reminder.contactType}
                      </span>
                    </div>
                    {reminder.subject && (
                      <div className="text-sm text-gray-600 mb-1">Subject: {reminder.subject}</div>
                    )}
                    {reminder.result && (
                      <div className="text-sm text-gray-600">Result: {reminder.result}</div>
                    )}
                  </div>
                  <form action={handleDeleteReminder}>
                    <input type="hidden" name="id" value={reminder.id} />
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun rappel ajouté pour le moment
            </div>
          )}
        </div>
      </div>

      {/* Add Line Modal */}
      {isAddLineModalOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter Ligne de Commande</h3>
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
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variante</label>
                <select
                  name="variantId"
                  required
                  defaultValue=""
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité Commandée</label>
                <input
                  name="quantityOrdered"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  placeholder="Entrez la quantité"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

      {/* Receive Modal */}
      {receivingLine && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recevoir Articles</h3>
              <button
                onClick={() => setReceivingLine(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleReceive} className="p-6 space-y-4">
              <input type="hidden" name="lineId" value={receivingLine.id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variante</label>
                <div className="text-gray-900 font-medium">
                  {receivingLine.variant.material.name} — {receivingLine.variant.internalRef || receivingLine.variant.supplierRef || `ID: ${receivingLine.variant.id}`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Commandé:</span>
                  <div className="font-medium">{receivingLine.quantityOrdered}</div>
                </div>
                <div>
                  <span className="text-gray-500">Déjà Reçu:</span>
                  <div className="font-medium">{receivingLine.quantityReceived}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité à Recevoir</label>
                <input
                  name="quantityReceived"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  max={Number(receivingLine.quantityOrdered) - Number(receivingLine.quantityReceived)}
                  required
                  placeholder={`Max: ${Number(receivingLine.quantityOrdered) - Number(receivingLine.quantityReceived)}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setReceivingLine(null)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Recevoir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {isAddReminderModalOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter Rappel</h3>
              <button
                onClick={() => setIsAddReminderModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={handleAddReminder} className="p-6 space-y-4">
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="reminderDate"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de Contact</label>
                <select
                  name="contactType"
                  defaultValue="PHONE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="PHONE">Téléphone</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="VISIT">Visite</option>
                  <option value="MESSAGE">Message</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <input
                  name="subject"
                  placeholder="Sujet du rappel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Résultat</label>
                <textarea
                  name="result"
                  placeholder="Résultat ou notes"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddReminderModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Ajouter Rappel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
