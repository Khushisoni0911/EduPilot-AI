
/**
 * Popup Bottom Navigation Component
 */

import React from 'react';
import { Home, BookOpen, Settings } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

type PopupPage = 'home' | 'notes' | 'settings';

interface NavigationProps {
  currentPage: PopupPage;
  onNavigate: (page: PopupPage) => void;
}

const navItems = [
  { id: 'home' as PopupPage, label: 'Home', icon: Home },
  { id: 'notes' as PopupPage, label: 'Notes', icon: BookOpen },
  { id: 'settings' as PopupPage, label: 'Settings', icon: Settings },
];

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
}) => {
  return (
    <nav className="flex shrink-0 border-t border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = currentPage === id;

        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5',
              'text-xs font-medium transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
              isActive
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
            )}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              size={18}
              className={
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-slate-500'
              }
            />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
