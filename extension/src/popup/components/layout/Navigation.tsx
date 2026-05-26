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

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="flex border-t border-gray-200 bg-white shrink-0">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = currentPage === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5',
              'text-xs font-medium transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
              isActive
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
            aria-label={label}
          >
            <Icon
              size={18}
              className={isActive ? 'text-blue-600' : 'text-gray-400'}
            />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;