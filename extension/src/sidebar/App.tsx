/**
 * Sidebar Application Root Component
 *
 * This is the root of the sidebar React app that gets injected
 * into web pages. It manages:
 * - Overall sidebar layout
 * - Panel navigation (Summary, Quiz, Notes, etc.)
 * - Open/close animation state
 * - Communication with background worker
 */
import AuthPage from '../popup/pages/AuthPage';
import { getSession } from '../shared/utils/auth';
import React, { useState, useCallback, useEffect  } from 'react';
import { sendToBackground } from '../shared/utils/messaging';
import {
  DEFAULT_SETTINGS,
  type AppSettings,
} from '../shared/types/types';

import SidebarContainer from './components/SidebarContainer';
import SidebarHeader from './components/SidebarHeader';
import SidebarNav from './components/SidebarNav';
import SummaryPanel from './panels/SummaryPanel';
import QuizPanel from './panels/QuizPanel';
import NotesPanel from './panels/NotesPanel';
import ExplainPanel from './panels/ExplainPanel';
import FlashcardsPanel from './panels/FlashcardsPanel';
import type { SidebarPanel } from '../shared/types/types';

// ============================================
// Props Interface
// ============================================

interface SidebarAppProps {
  isOpen: boolean;
  onClose: () => void;
   initialPanel?: SidebarPanel;
}

// ============================================
// Component
// ============================================

const SidebarApp: React.FC<SidebarAppProps> = ({
  isOpen,
  onClose,
  initialPanel = 'summary',
}) => {
  const [activePanel, setActivePanel] = useState<SidebarPanel>(initialPanel);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isDark, setIsDark] = useState(false);
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
useEffect(() => {
  let mounted = true;

  const loadSettings = async () => {
    try {
      const response = await sendToBackground<undefined, AppSettings>(
        'GET_SETTINGS'
      );

      if (mounted && response.success && response.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...response.data });
      }
    } catch (error) {
      console.error('[EduPilot Theme] Failed to load settings:', error);
    }
  };

  void loadSettings();

  return () => {
    mounted = false;
  };
}, []);



   const handlePanelChange = useCallback((panel: SidebarPanel) => {
    setActivePanel(panel);
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      const shouldUseDark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' && prefersDark);

      setIsDark(shouldUseDark);
    };

    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [settings.theme]);

  if (!isOpen) return null;
  if (isCheckingAuth) {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Checking your session...</p>
    </div>
  );
}

if (!isAuthenticated) {
  return (
    <div className="h-full overflow-y-auto">
      <AuthPage onAuthenticated={() => setIsAuthenticated(true)} />
    </div>
  );
}

  return (
    <div
      className={isDark ? 'dark h-full' : 'h-full'}
      style={{
        height: '100%',
        backgroundColor: isDark ? '#111827' : '#ffffff',
        color: isDark ? '#f9fafb' : '#111827',
      }}
    >
      <SidebarContainer>
        <SidebarHeader onClose={onClose} />

        <SidebarNav
          activePanel={activePanel}
          onPanelChange={handlePanelChange}
        />

        <div className="flex-1 overflow-y-auto">
          {activePanel === 'summary' && <SummaryPanel />}
          {activePanel === 'quiz' && <QuizPanel />}
          {activePanel === 'notes' && <NotesPanel />}
          {activePanel === 'explain' && <ExplainPanel />}
          {activePanel === 'flashcards' && <FlashcardsPanel />}
        </div>
      </SidebarContainer>
    </div>
  );
};

export default SidebarApp;