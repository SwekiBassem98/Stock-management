import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

type Props = {
  setIsCollapsed: (isCollapsed: boolean) => void;
  isCollapsed: boolean;
  title?: string;
};

export default function Header({ setIsCollapsed, isCollapsed, title = "Gestion de Stock" }: Props) {
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-indigo-600 px-3 text-white">
      {/* Toggle Button with Smart Icon Logic */}
      <button
        onClick={() => handleToggle()}
        className="flex h-8 w-8 transform items-center justify-center rounded-md ring-1 ring-white/10 transition-colors duration-200 ease-in-out hover:bg-white/10"
      >
        {isCollapsed ? (
          <>
            {/* Desktop: Show open icon when collapsed */}
            <PanelLeftOpen className="hidden h-5 w-5 md:block" />
            {/* Mobile: Show close icon when collapsed */}
            <PanelLeftClose className="block h-5 w-5 md:hidden" />
          </>
        ) : (
          <>
            {/* Desktop: Show close icon when expanded */}
            <PanelLeftClose className="hidden h-5 w-5 md:block" />
            {/* Mobile: Show open icon when expanded */}
            <PanelLeftOpen className="block h-5 w-5 md:hidden" />
          </>
        )}
      </button>

      <span className="text-lg font-semibold">{title}</span>
      
      {/* User menu or other header content can go here */}
      <div className="w-8"></div> {/* Spacer for centering */}
    </div>
  );
}
