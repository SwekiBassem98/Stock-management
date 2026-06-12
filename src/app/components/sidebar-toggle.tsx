'use client';

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

export default function SidebarToggle({ isOpen, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`absolute top-1/2 -translate-y-1/2 z-40 w-8 h-8 bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:bg-gray-50 flex items-center justify-center ${
        isOpen ? 'left-64' : 'left-0'
      }`}
      title={isOpen ? 'Fermer la barre latérale' : 'Ouvrir la barre latérale'}
    >
      {isOpen ? (
        <>
          {/* Desktop: Show close icon when expanded */}
          <svg className="hidden md:block w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {/* Mobile: Show open icon when expanded (sidebar will overlay) */}
          <svg className="block md:hidden w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </>
      ) : (
        <>
          {/* Desktop: Show open icon when collapsed */}
          <svg className="hidden md:block w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {/* Mobile: Show close icon when collapsed (sidebar is overlay) */}
          <svg className="block md:hidden w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </>
      )}
    </button>
  );
}
