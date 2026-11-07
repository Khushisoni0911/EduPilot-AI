
/**
 * Sidebar Application Root Component
 */
import React, { useState, useCallback, useEffect } from 'react';
import AuthPage from '../popup/pages/AuthPage';
import { getSession, logout } from '../shared/utils/auth';
import { sendToBackground } from '../shared/utils/messaging';
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type SidebarPanel,
} from '../shared/types/types';

import SidebarContainer from './components/SidebarContainer';
import SidebarHeader from './components/SidebarHeader';
import SidebarNav from './components/SidebarNav';
import SummaryPanel from './panels/SummaryPanel';
import QuizPanel from './panels/QuizPanel';
import NotesPanel from './panels/NotesPanel';
import ExplainPanel from './panels/ExplainPanel';
import FlashcardsPanel from './panels/FlashcardsPanel';

interface SidebarAppProps {
  isOpen: boolean;
  onClose: () => void;
  initialPanel?: SidebarPanel;
}

const SidebarApp: React.FC<SidebarAppProps> = ({
  isOpen,
  onClose,
  initialPanel = 'summary',
}) => {
  const [activePanel, setActivePanel] =
    useState<SidebarPanel>(initialPanel);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [settings, setSettings] =
    useState<AppSettings>(DEFAULT_SETTINGS);

  const [isDark, setIsDark] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const response = await sendToBackground<undefined, AppSettings>(
        'GET_SETTINGS'
      );

      if (response.success && response.data) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...response.data,
        });
      }
    } catch (error) {
      console.error('[EduPilot Theme] Failed to load settings:', error);
    }
  }, []);

  // Check authentication.
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const session = await getSession();

        if (mounted) {
          setIsAuthenticated(session !== null);
        }
      } catch (error) {
        console.error('[EduPilot Auth] Session check failed:', error);

        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Load settings and listen for changes.
  useEffect(() => {
    void loadSettings();

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName !== 'sync' && areaName !== 'local') return;

      if (
        'edupilot_auth_token' in changes ||
        'edupilot_auth_user' in changes
      ) {
        const token = changes.edupilot_auth_token?.newValue;
        const user = changes.edupilot_auth_user?.newValue;

        setIsAuthenticated(Boolean(token && user));
      }

      // Reload preferences when extension storage changes.
      void loadSettings();
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [loadSettings]);

  // Apply Light / Dark / System preference.
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    const applyTheme = () => {
      const shouldUseDark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' && mediaQuery.matches);

      setIsDark(shouldUseDark);
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [settings.theme]);

  const handleLogout = useCallback(async () => {
    await logout();
    setIsAuthenticated(false);
  }, []);

  const handlePanelChange = useCallback((panel: SidebarPanel) => {
    setActivePanel(panel);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setActivePanel('summary');
    }
  }, [isAuthenticated]);

  if (!isOpen) return null;

  return (
    <div
      className={`${isDark ? 'dark' : ''} h-full min-h-0`}
      style={{
        height: '100%',
        colorScheme: isDark ? 'dark' : 'light',
      }}
    >
      <SidebarContainer>
        {isCheckingAuth ? (
          <div className="flex h-full items-center justify-center bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            <p className="text-sm">Checking your session...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="h-full min-h-0 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <AuthPage
              onAuthenticated={() => setIsAuthenticated(true)}
            />
          </div>
        ) : (
          <>
            <SidebarHeader
              onClose={onClose}
            />

            <SidebarNav
              activePanel={activePanel}
              onPanelChange={handlePanelChange}
            />

            <div className="min-h-0 flex-1 overflow-y-auto bg-white dark:bg-gray-900">
              {activePanel === 'summary' && <SummaryPanel />}
              {activePanel === 'quiz' && <QuizPanel />}
              {activePanel === 'notes' && <NotesPanel />}
              {activePanel === 'explain' && <ExplainPanel />}
              {activePanel === 'flashcards' && <FlashcardsPanel />}
            </div>
          </>
        )}
      </SidebarContainer>
    </div>
  );
};

export default SidebarApp;
