
/**
 * Popup Application Root
 *
 * Manages popup-level state, navigation and global theme.
 */

import React, { useEffect, useState } from 'react';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Navigation from './components/layout/Navigation';
import HomePage from './pages/HomePage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';

import { sendToBackground } from '../shared/utils/messaging';
import {
  DEFAULT_SETTINGS,
  type AppSettings,
} from '../shared/types/types';

// ============================================
// Types
// ============================================

type PopupPage = 'home' | 'notes' | 'settings';

// ============================================
// Component
// ============================================

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PopupPage>('home');

  const [theme, setTheme] = useState<AppSettings['theme']>(
    DEFAULT_SETTINGS.theme
  );

  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Load the saved theme preference.
  useEffect(() => {
    let isMounted = true;

    const loadTheme = async () => {
      try {
        const response = await sendToBackground<undefined, AppSettings>(
          'GET_SETTINGS'
        );

        if (isMounted && response.success && response.data) {
          setTheme(response.data.theme ?? DEFAULT_SETTINGS.theme);
        }
      } catch (error) {
        console.error('[EduPilot] Could not load theme preference:', error);
      }
    };

    void loadTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep System theme synchronized with the operating system.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    setSystemPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const isDark =
    theme === 'dark' || (theme === 'system' && systemPrefersDark);
    useEffect(() => {
  document.documentElement.classList.toggle('dark', isDark);

  return () => {
    document.documentElement.classList.remove('dark');
  };
}, [isDark]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;

      case 'notes':
        return <NotesPage />;

      case 'settings':
        return (
          <SettingsPage
            theme={theme}
            onThemeChange={setTheme}
          />
        );

      default:
        return <HomePage />;
    }
  };

  return (
    <div
      className={`w-[400px] h-[580px] flex flex-col font-sans overflow-hidden transition-colors duration-200 ${
        isDark
          ? 'dark bg-slate-900 text-slate-100'
          : 'bg-slate-50 text-slate-800'
      }`}
    >
      <Header />

      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>

      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <Footer />
    </div>
  );
};

export default App;
