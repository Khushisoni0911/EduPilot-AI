/**
 * Sidebar Container
 * The outermost wrapper for the sidebar UI.
 * Provides the base layout and background.
 */

import React from 'react';
import { cn } from '../../shared/utils/cn';

interface SidebarContainerProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        // Full height, flex column layout
        'flex flex-col h-full w-full',
        // Background and border
        'bg-white border-l border-gray-200',
        // Font settings
        'font-sans text-gray-900',
        // Prevent text selection bleeding from page
        'select-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

export default SidebarContainer;