'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navigationItems = [
  {
    href: '/references/categories', 
    label: 'Catégories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )
  },
  { 
    href: '/references/materials', 
    label: 'Matériaux',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  { 
    href: '/references/variants', 
    label: 'Variantes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  { 
    href: '/references/suppliers', 
    label: 'Fournisseurs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    href: '/references/supplier-orders', 
    label: 'Commandes Fournisseurs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
];

const stockItems = [
  {
    href: '/stock/stock',
    label: 'Niveaux de Stock',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  {
    href: '/stock/movements',
    label: 'Mouvements',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  }
];

const achatItems = [
  {
    href: '/achat/invoices',
    label: 'Factures',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }
];

export default function SidebarNav({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const [isReferencesOpen, setIsReferencesOpen] = useState(true);
  const [isStockOpen, setIsStockOpen] = useState(true);
  const [isAchatOpen, setIsAchatOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      setUser(JSON.parse(authUser));
    }
  }, []);

  return (
    <div className={`bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out ${
      isOpen ? 'w-64' : 'w-0 md:w-16 overflow-hidden'
    }`}>
      {/* Logo/Brand */}
      <div className={`border-b border-gray-200 ${isOpen ? 'p-5' : 'p-2 flex justify-center'}`}>
        <Link href="/" className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          {isOpen && <span className="text-xl font-bold text-gray-900">Gestion Stock</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isOpen ? 'p-4' : 'p-2'}`}>
        <div className="space-y-2">
          {/* Dashboard Link - Admin Only */}
          {user?.role === 'admin' && (
            <Link
              href="/dashboard"
              className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2 rounded-lg transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              title={!isOpen ? 'Tableau de Bord' : ''}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              {isOpen && <span className="font-medium">Tableau de Bord</span>}
            </Link>
          )}

          {/* References Menu */}
          <div>
            <button
              onClick={() => isOpen && setIsReferencesOpen(!isReferencesOpen)}
              className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} w-full ${isOpen ? 'px-3' : 'px-2'} py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors`}
              title={!isOpen ? 'Références' : ''}
            >
              <div className={`flex items-center ${isOpen ? 'gap-3' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {isOpen && <span className="font-medium">Références</span>}
              </div>
              {isOpen && (
                <svg 
                  className={`w-4 h-4 transition-transform ${isReferencesOpen ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            
            {/* References Submenu */}
            {isOpen && isReferencesOpen && (
              <div className="ml-8 mt-2 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stock Menu */}
          <div>
            <button
              onClick={() => isOpen && setIsStockOpen(!isStockOpen)}
              className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} w-full ${isOpen ? 'px-3' : 'px-2'} py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors`}
              title={!isOpen ? 'Stock' : ''}
            >
              <div className={`flex items-center ${isOpen ? 'gap-3' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {isOpen && <span className="font-medium">Stock</span>}
              </div>
              {isOpen && (
                <svg 
                  className={`w-4 h-4 transition-transform ${isStockOpen ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            
            {/* Stock Submenu */}
            {isOpen && isStockOpen && (
              <div className="ml-8 mt-2 space-y-1">
                {stockItems.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Achats Menu */}
          <div>
            <button
              onClick={() => isOpen && setIsAchatOpen(!isAchatOpen)}
              className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} w-full ${isOpen ? 'px-3' : 'px-2'} py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors`}
              title={!isOpen ? 'Achats' : ''}
            >
              <div className={`flex items-center ${isOpen ? 'gap-3' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {isOpen && <span className="font-medium">Achats</span>}
              </div>
              {isOpen && (
                <svg 
                  className={`w-4 h-4 transition-transform ${isAchatOpen ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            
            {/* Achats Submenu */}
            {isOpen && isAchatOpen && (
              <div className="ml-8 mt-2 space-y-1">
                {achatItems.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/reports"
            className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors`}
            title={!isOpen ? 'Production' : ''}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {isOpen && <span className="font-medium">Production</span>}
          </Link>
        </div>
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Gestion de Stock v1.0
          </div>
        </div>
      )}
    </div>
  );
}