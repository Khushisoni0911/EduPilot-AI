
import React, { useEffect, useState } from 'react';
import {
  Settings,
  Palette,
  PanelRight,
  BookOpen,
  Brain,
  Languages,
  Keyboard,
  RotateCcw,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { sendToBackground } from '../../shared/utils/messaging';
import {
  DEFAULT_SETTINGS,
  type AppSettings,
} from '../../shared/types/types';
const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const response = await sendToBackground<undefined, AppSettings>(
          'GET_SETTINGS'
        );

        if (!response.success) {
          throw new Error(response.error || 'Could not load settings.');
        }

        if (isMounted && response.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...response.data });
        }
      } catch {
        if (isMounted) {
          setError('Could not load saved settings. Default values are shown.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice('');
    setError('');
  };

  
const handleSave = async () => {
  setIsSaving(true);
  setNotice('');
  setError('');

  try {
    const response = await sendToBackground<AppSettings, void>(
      'SAVE_SETTINGS',
      settings
    );

    if (!response.success) {
      throw new Error(response.error || 'Could not save settings.');
    }

    const verifyResponse = await sendToBackground<undefined, AppSettings>(
      'GET_SETTINGS'
    );

    if (!verifyResponse.success || !verifyResponse.data) {
      throw new Error('Settings were sent, but verification failed.');
    }

    setSettings(verifyResponse.data);
    setNotice('Settings saved and verified successfully.');
  } catch (error) {
    console.error('[EduPilot Settings] Save failed:', error);
    setError(
      error instanceof Error
        ? error.message
        : 'Could not save settings. Please try again.'
    );
  } finally {
    setIsSaving(false);
  }
};


  const handleReset = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    setNotice('');
    setError('');
  };

  const selectClass =
    'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

  const sectionClass = 'rounded-xl border border-gray-200 bg-white p-4';

  const toggleClass = (enabled: boolean) =>
    `relative h-6 w-11 shrink-0 rounded-full transition-colors ${
      enabled ? 'bg-blue-600' : 'bg-gray-300'
    }`;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4 text-gray-800">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
          <Settings size={22} className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-base font-semibold">Settings</h2>
          <p className="text-xs text-gray-500">
            Personalize your EduPilot experience
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700"
        >
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="space-y-4">
        <section className={sectionClass}>
          <div className="mb-4 flex items-center gap-2">
            <Palette size={17} className="text-blue-600" />
            <h3 className="text-sm font-semibold">Appearance</h3>
          </div>

          <label className="block text-xs font-medium text-gray-600">
            Theme
            <select
              value={settings.theme}
              onChange={(event) =>
                updateSetting(
                  'theme',
                  event.target.value as AppSettings['theme']
                )
              }
              className={selectClass}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">Follow system preference</option>
            </select>
          </label>
          <p className="mt-1 text-xs text-gray-400">
            Saves your preferred theme. Applying it across the interface
            requires theme support in the UI.
          </p>
        </section>

        <section className={sectionClass}>
          <div className="mb-4 flex items-center gap-2">
            <PanelRight size={17} className="text-blue-600" />
            <h3 className="text-sm font-semibold">Sidebar</h3>
          </div>

          <label className="block text-xs font-medium text-gray-600">
            Sidebar position
            <select
              value={settings.sidebarPosition}
              onChange={(event) =>
                updateSetting(
                  'sidebarPosition',
                  event.target.value as AppSettings['sidebarPosition']
                )
              }
              className={selectClass}
            >
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </label>

          <label className="mt-4 block text-xs font-medium text-gray-600">
            Sidebar width: {settings.sidebarWidth}px
            <input
              type="range"
              min={300}
              max={600}
              step={10}
              value={settings.sidebarWidth}
              onChange={(event) =>
                updateSetting('sidebarWidth', Number(event.target.value))
              }
              className="mt-3 w-full accent-blue-600"
            />
            <span className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>300 px</span>
              <span>600 px</span>
            </span>
          </label>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium">Auto-open sidebar</p>
              <p className="mt-1 text-xs text-gray-500">
                Open the assistant automatically when supported.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.autoOpenSidebar}
              aria-label="Auto-open sidebar"
              onClick={() =>
                updateSetting('autoOpenSidebar', !settings.autoOpenSidebar)
              }
              className={toggleClass(settings.autoOpenSidebar)}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  settings.autoOpenSidebar
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-4 flex items-center gap-2">
            <BookOpen size={17} className="text-blue-600" />
            <h3 className="text-sm font-semibold">Learning preferences</h3>
          </div>

          <label className="block text-xs font-medium text-gray-600">
            Summary length
            <select
              value={settings.summaryLength}
              onChange={(event) =>
                updateSetting(
                  'summaryLength',
                  event.target.value as AppSettings['summaryLength']
                )
              }
              className={selectClass}
            >
              <option value="brief">Brief</option>
              <option value="detailed">Detailed</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </label>

          <label className="mt-4 block text-xs font-medium text-gray-600">
            Default quiz difficulty
            <select
              value={settings.quizDifficulty}
              onChange={(event) =>
                updateSetting(
                  'quizDifficulty',
                  event.target.value as AppSettings['quizDifficulty']
                )
              }
              className={selectClass}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>

          <label className="mt-4 block text-xs font-medium text-gray-600">
            Language
            <select
              value={settings.language}
              onChange={(event) => updateSetting('language', event.target.value)}
              className={selectClass}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </label>
        </section>

        <section className={sectionClass}>
          <div className="mb-4 flex items-center gap-2">
            <Brain size={17} className="text-blue-600" />
            <h3 className="text-sm font-semibold">Accessibility</h3>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium">Keyboard shortcuts</p>
              <p className="mt-1 text-xs text-gray-500">
                Enable supported keyboard shortcuts.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.keyboardShortcuts}
              aria-label="Keyboard shortcuts"
              onClick={() =>
                updateSetting('keyboardShortcuts', !settings.keyboardShortcuts)
              }
              className={toggleClass(settings.keyboardShortcuts)}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  settings.keyboardShortcuts
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Languages size={14} />
            <span>Language preferences are saved with your settings.</span>
            <Keyboard size={14} className="ml-auto" />
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 mt-4 flex gap-2 border-t border-gray-200 bg-gray-50 py-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          <RotateCcw size={14} />
          Reset defaults
        </button>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {isSaving ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
