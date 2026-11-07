
/**
 * Sidebar Navigation Component
 */
import React from 'react';
import {
  FileText,
  HelpCircle,
  BookOpen,
  Zap,
  Layers,
} from 'lucide-react';

import { cn } from '../../shared/utils/cn';
import type { SidebarPanel } from '../../shared/types/types';

interface NavItem {
  id: SidebarPanel;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'summary', label: 'Summary', icon: <FileText size={15} /> },
  { id: 'quiz', label: 'Quiz', icon: <HelpCircle size={15} /> },
  { id: 'notes', label: 'Notes', icon: <BookOpen size={15} /> },
  { id: 'explain', label: 'Explain', icon: <Zap size={15} /> },
  { id: 'flashcards', label: 'Flashcards', icon: <Layers size={15} /> },
];

interface SidebarNavProps {
  activePanel: SidebarPanel;
  onPanelChange: (panel: SidebarPanel) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  activePanel,
  onPanelChange,
}) => {
  return (
    <nav
      className="flex shrink-0 gap-0.5 border-b border-gray-200 bg-gray-50 px-1 pt-1 dark:border-gray-700 dark:bg-gray-900"
      role="tablist"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activePanel === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onPanelChange(item.id)}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-t-lg px-1 py-2',
              'text-xs font-medium transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
              isActive
                ? 'relative z-10 -mb-px border border-gray-200 border-b-white bg-white text-blue-600 shadow-sm dark:border-gray-700 dark:border-b-gray-800 dark:bg-gray-800 dark:text-blue-400'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            )}
            aria-selected={isActive}
            role="tab"
            title={item.label}
          >
            <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
              {item.icon}
            </span>

            <span className="w-full truncate text-center">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
