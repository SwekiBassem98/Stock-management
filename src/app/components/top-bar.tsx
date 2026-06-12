'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

type Props = {
  title?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
};

export default function TopBar({ title = "Gestion de Stock", isSidebarOpen = true, onToggleSidebar }: Props) {
  const [user, setUser] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      setUser(JSON.parse(authUser));
    }
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('authUser');
    router.push('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (!user) {
    return null; // Don't render if no user
  }

  const handleToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className={`py-4 flex items-center justify-between transition-all duration-300 ${
          isSidebarOpen ? 'px-6' : 'pl-20 pr-6'
        }`}>
          {/* Toggle Button with Smart Icon Logic */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggle}
              className="flex h-8 w-8 transform items-center justify-center rounded-md ring-1 ring-gray-300 transition-colors duration-200 ease-in-out hover:bg-gray-100"
            >
              {!isSidebarOpen ? (
                <>
                  {/* Desktop: Show open icon when collapsed */}
                  <PanelLeftOpen className="hidden h-5 w-5 md:block text-gray-600" />
                  {/* Mobile: Show close icon when collapsed */}
                  <PanelLeftClose className="block h-5 w-5 md:hidden text-gray-600" />
                </>
              ) : (
                <>
                  {/* Desktop: Show close icon when expanded */}
                  <PanelLeftClose className="hidden h-5 w-5 md:block text-gray-600" />
                  {/* Mobile: Show open icon when expanded */}
                  <PanelLeftOpen className="block h-5 w-5 md:hidden text-gray-600" />
                </>
              )}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user.username}</div>
                <div className="text-gray-500 capitalize">{user.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la déconnexion</h3>
                <p className="text-gray-600">Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}