'use client';

import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'delete' | 'warning' | 'logout';
  confirmButtonColor?: 'red' | 'indigo';
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  icon = 'warning',
  confirmButtonColor = 'red'
}: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (icon) {
      case 'delete':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'logout':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  const getIconBgColor = () => {
    switch (icon) {
      case 'delete':
      case 'logout':
        return 'bg-red-100';
      default:
        return 'bg-yellow-100';
    }
  };

  const getConfirmButtonClasses = () => {
    const baseClasses = "flex-1 px-4 py-3 rounded-lg transition-colors font-medium";
    if (confirmButtonColor === 'red') {
      return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
    }
    return `${baseClasses} bg-indigo-600 text-white hover:bg-indigo-700`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all relative">
        <div className="p-6">
          <div className={`flex items-center justify-center w-12 h-12 mx-auto ${getIconBgColor()} rounded-full mb-4`}>
            {getIcon()}
          </div>
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={getConfirmButtonClasses()}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
