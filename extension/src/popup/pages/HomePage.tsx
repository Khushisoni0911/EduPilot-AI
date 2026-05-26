/**
 * Popup Home Page
 *
 * The main screen users see when they open the extension.
 * Shows:
 * - Current page info
 * - Quick action buttons
 * - Sidebar toggle
 */

import React, { useEffect, useState } from 'react';
import {
  FileText, HelpCircle, BookOpen, Zap,
  PanelRight, ExternalLink, Globe
} from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import { sendToBackground } from '../../shared/utils/messaging';
import type { TabInfo } from '../../shared/types';

// ============================================
// Quick Action Config
// ============================================

const QUICK_ACTIONS = [
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Get key points',
    icon: FileText,
    color: 'blue',
    panel: 'summary',
  },
  {
    id: 'quiz',
    label: 'Generate Quiz',
    description: 'Test knowledge',
    icon: HelpCircle,
    color: 'green',
    panel: 'quiz',
  },
  {
    id: 'notes',
    label: 'Take Notes',
    description: 'Save insights',
    icon: BookOpen,
    color: 'amber',
    panel: 'notes',
  },
  {
    id: 'explain',
    label: 'Explain',
    description: 'Simplify text',
    icon: Zap,
    color: 'purple',
    panel: 'explain',
  },
] as const;

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100',
  green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-100',
  amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100',
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100',
};

// ============================================
// Component
// ============================================

const HomePage: React.FC = () => {
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [isLoadingTab, setIsLoadingTab] = useState(true);
  const [sidebarStatus, setSidebarStatus] = useState<'idle' | 'opening' | 'error'>('idle');

  // Get current tab info when popup opens
  useEffect(() => {
    const fetchTabInfo = async () => {
      try {
        const response = await sendToBackground<undefined, TabInfo>('GET_ACTIVE_TAB_INFO');
        if (response.success && response.data) {
          setTabInfo(response.data);
        }
      } catch (error) {
        console.error('[HomePage] Failed to get tab info:', error);
      } finally {
        setIsLoadingTab(false);
      }
    };

    fetchTabInfo();
  }, []);

  const handleToggleSidebar = async () => {
    setSidebarStatus('opening');
    try {
      const response = await sendToBackground('TOGGLE_SIDEBAR');
      if (response.success) {
        setSidebarStatus('idle');
        // Close popup after opening sidebar
        window.close();
      } else {
        setSidebarStatus('error');
      }
    } catch {
      setSidebarStatus('error');
    }
  };

  const handleQuickAction = async (action: typeof QUICK_ACTIONS[number]) => {
    // Open sidebar and navigate to the relevant panel
    try {
      await sendToBackground('OPEN_SIDEBAR');
      window.close();
    } catch (error) {
      console.error('[HomePage] Failed to open sidebar for action:', action.id, error);
    }
  };

  const isPageSupported = tabInfo?.isSupported ?? false;

  return (
    <div className="flex flex-col h-full">
      {/* ── Current Page Info ─────────────────────── */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1.5">
          Current Page
        </p>
        {isLoadingTab ? (
          <div className="space-y-1.5">
            <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        ) : tabInfo ? (
          <div className="flex items-start gap-2">
            <Globe size={13} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-800 truncate" title={tabInfo.title}>
                {tabInfo.title}
              </p>
              <p className="text-[10px] text-gray-400 truncate" title={tabInfo.url}>
                {new URL(tabInfo.url).hostname}
              </p>
            </div>
            <a
              href={tabInfo.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
              aria-label="Open page"
            >
              <ExternalLink size={11} />
            </a>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Unable to detect page</p>
        )}
      </div>

      {/* ── Open Sidebar CTA ──────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <button
          onClick={handleToggleSidebar}
          disabled={!isPageSupported || sidebarStatus === 'opening'}
          className={cn(
            'w-full flex items-center justify-center gap-2.5',
            'py-2.5 px-4 rounded-xl text-sm font-semibold',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            isPageSupported
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
          title={!isPageSupported ? "Can't use on this page type" : undefined}
        >
          <PanelRight size={16} />
          <span>
            {sidebarStatus === 'opening'
              ? 'Opening...'
              : 'Open AI Assistant Panel'}
          </span>
        </button>
        {sidebarStatus === 'error' && (
          <p className="text-[10px] text-red-500 text-center mt-1.5">
            Could not open sidebar. Try refreshing the page.
          </p>
        )}
        {!isPageSupported && tabInfo && (
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            Extension not available on this page type
          </p>
        )}
        <p className="text-[10px] text-gray-400 text-center mt-1.5">
          Shortcut: Ctrl+Shift+S (⌘+Shift+S on Mac)
        </p>
      </div>

      {/* ── Quick Actions Grid ────────────────────── */}
      <div className="px-4 py-3 flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-2.5">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={!isPageSupported}
                className={cn(
                  'flex flex-col items-start gap-1.5 p-3 rounded-xl border',
                  'text-left transition-all duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  isPageSupported
                    ? cn(colorMap[action.color], 'cursor-pointer')
                    : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                )}
              >
                <Icon size={16} />
                <div>
                  <p className="text-xs font-semibold leading-none">{action.label}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;