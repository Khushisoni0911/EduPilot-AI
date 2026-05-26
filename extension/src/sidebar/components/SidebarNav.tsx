/**
 * Sidebar Navigation Component
 * Tab navigation bar for switching between feature panels.
 */

import React from 'react';
import { FileText, HelpCircle, BookOpen, Zap } from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import type { SidebarPanel } from '../../shared/types';

// ============================================
// Nav Items Config
// ============================================

interface NavItem {
  id: SidebarPanel;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'summary',
    label: 'Summary',
    icon: <FileText size={15} />,
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: <HelpCircle size={15} />,
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: <BookOpen size={15} />,
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: <Zap size={15} />,
  },
];

// ============================================
// Component
// ============================================

interface SidebarNavProps {
  activePanel: SidebarPanel;
  onPanelChange: (panel: SidebarPanel) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ activePanel, onPanelChange }) => {
  return (
    <nav className="flex bg-gray-50 border-b border-gray-200 px-1 pt-1 gap-0.5 shrink-0">
      {NAV_ITEMS.map((item) => {
        const isActive = activePanel === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onPanelChange(item.id)}
            className={cn(
              // Base styles
              'flex flex-col items-center gap-1 px-3 py-2 rounded-t-lg',
              'text-xs font-medium transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
              'flex-1 min-w-0',
              // Active state
              isActive
                ? 'bg-white text-blue-600 border border-gray-200 border-b-white -mb-px shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
            aria-selected={isActive}
            role="tab"
            title={item.label}
          >
            <span className={cn(isActive ? 'text-blue-600' : 'text-gray-400')}>
              {item.icon}
            </span>
            <span className="truncate w-full text-center">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default SidebarNav;