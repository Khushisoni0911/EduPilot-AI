/**
 * Sidebar Header Component
 * Displays the logo, title, and close button for the sidebar.
 */

import React from 'react';
import { X, GraduationCap, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

interface SidebarHeaderProps {
  onClose: () => void;
  isConnected?: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onClose,
  isConnected = true,
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shrink-0">
      {/* Logo + Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-none">AI Student Assistant</h1>
          <div className="flex items-center gap-1 mt-0.5">
            {isConnected ? (
              <>
                <Wifi size={10} className="text-green-300" />
                <span className="text-[10px] text-blue-200">Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={10} className="text-red-300" />
                <span className="text-[10px] text-red-200">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={cn(
          'w-7 h-7 rounded-lg',
          'flex items-center justify-center',
          'bg-white/10 hover:bg-white/25',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-white/50'
        )}
        aria-label="Close AI Assistant"
        title="Close (Ctrl+Shift+S)"
      >
        <X size={15} className="text-white" />
      </button>
    </header>
  );
};

export default SidebarHeader;