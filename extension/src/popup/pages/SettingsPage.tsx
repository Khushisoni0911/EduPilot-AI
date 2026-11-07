
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
  LogOut,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

import { sendToBackground } from '../../shared/utils/messaging';
import {
  DEFAULT_SETTINGS,
  type AppSettings,
} from '../../shared/types/types';
import { logout } from '../../shared/utils/auth';

interface SettingsPageProps {
  theme: AppSettings['theme'];
  onThemeChange: (theme: AppSettings['theme']) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  theme,
  onThemeChange,
}) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
          const loadedSettings = {
            ...DEFAULT_SETTINGS,
            ...response.data,
          };

          setSettings(loadedSettings);
          onThemeChange(loadedSettings.theme);
        }
      } catch {
        if (isMounted) {
          setError('Could not load saved settings. Default values are shown.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [onThemeChange]);

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

      const verifiedSettings = {
        ...DEFAULT_SETTINGS,
        ...verifyResponse.data,
      };

      setSettings(verifiedSettings);
      onThemeChange(verifiedSettings.theme);
      setNotice('Your settings have been saved successfully!');
    } catch (err) {
      console.error('[EduPilot Settings] Save failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save settings. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setNotice('');
    setError('');

    try {
      await logout();
      setNotice('Logged out successfully.');
    } catch {
      setError('Could not log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    onThemeChange(DEFAULT_SETTINGS.theme);
    setNotice('');
    setError('');
  };

  const selectClass =
    'mt-2 block w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:bg-slate-700 dark:focus:ring-blue-900/40';

  const cardClass =
    'min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800';

  const toggleClass = (enabled: boolean) =>
    `relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
      enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
    }`;

  const sectionHeading = (
    icon: React.ReactNode,
    title: string,
    subtitle: string
  ) => (
    <div className="mb-4 flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-full min-w-0 items-center justify-center gap-3 bg-slate-50 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        <Loader2 size={20} className="animate-spin text-blue-600" />
        Loading your settings...
      </div>
    );
  }

  return (
    <div className="box-border h-full min-h-0 w-full min-w-0 overflow-y-auto overflow-x-hidden bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">

      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-5 py-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Settings size={23} />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Settings
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Manage your EduPilot experience
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 space-y-4 px-4 pb-5 pt-5">

        {error && (
          <div
            role="alert"
            className="flex min-w-0 items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex min-w-0 items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-words">{notice}</span>
          </div>
        )}

        {/* Appearance */}
        <section className={cardClass}>
          {sectionHeading(
            <Palette size={19} />,
            'Appearance',
            'Choose your preferred visual experience'
          )}

          <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            Interface theme
          </p>

          <div className="grid min-w-0 grid-cols-3 gap-2">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map(({ value, label, icon: Icon }) => {
              const selected = theme === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const selectedTheme = value as AppSettings['theme'];
                    updateSetting('theme', selectedTheme);
                    onThemeChange(selectedTheme);
                  }}
                  className={`flex min-w-0 flex-col items-center gap-2 rounded-xl border p-3 transition ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100 dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-900'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  <Icon size={19} />
                  <span className="text-[11px] font-semibold">{label}</span>
                  {selected && (
                    <CheckCircle2 size={13} className="text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Sidebar */}
        <section className={cardClass}>
          {sectionHeading(
            <PanelRight size={19} />,
            'Sidebar',
            'Customize your assistant workspace'
          )}

          <label className="block min-w-0 text-xs font-semibold text-slate-600 dark:text-slate-300">
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
              <option value="right">Right side</option>
              <option value="left">Left side</option>
            </select>
          </label>

          {/* Width slider */}
          <div className="mt-5 min-w-0">
            <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
              <label className="min-w-0 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Sidebar width
              </label>
              <span className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                {settings.sidebarWidth}px
              </span>
            </div>

            <div className="w-full min-w-0 overflow-hidden">
              <input
                type="range"
                min={300}
                max={600}
                step={10}
                value={settings.sidebarWidth}
                onChange={(event) =>
                  updateSetting('sidebarWidth', Number(event.target.value))
                }
                className="block h-6 w-full max-w-full min-w-0 cursor-pointer appearance-none accent-blue-600"
              />
            </div>

            <div className="flex w-full min-w-0 justify-between text-[10px] font-medium text-slate-400">
              <span>300 px</span>
              <span>600 px</span>
            </div>
          </div>

          {/* Auto-open toggle */}
          <div className="mt-5 flex min-w-0 items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-100">
                Auto-open sidebar
              </p>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                Open automatically when supported.
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
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  settings.autoOpenSidebar ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Learning Preferences */}
        <section className={cardClass}>
          {sectionHeading(
            <BookOpen size={19} />,
            'Learning preferences',
            'Personalize how AI helps you learn'
          )}

          <label className="block min-w-0 text-xs font-semibold text-slate-600 dark:text-slate-300">
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

          <label className="mt-4 block min-w-0 text-xs font-semibold text-slate-600 dark:text-slate-300">
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

          <label className="mt-4 block min-w-0 text-xs font-semibold text-slate-600 dark:text-slate-300">
            Preferred language
            <select
              value={settings.language}
              onChange={(event) =>
                updateSetting('language', event.target.value)
              }
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

        {/* Accessibility */}
        <section className={cardClass}>
          {sectionHeading(
            <Brain size={19} />,
            'Accessibility',
            'Make your learning experience comfortable'
          )}

          <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-slate-600 dark:text-blue-400">
                <Keyboard size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-100">
                  Keyboard shortcuts
                </p>
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  Enable supported keyboard shortcuts.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.keyboardShortcuts}
              aria-label="Keyboard shortcuts"
              onClick={() =>
                updateSetting(
                  'keyboardShortcuts',
                  !settings.keyboardShortcuts
                )
              }
              className={toggleClass(settings.keyboardShortcuts)}
            >
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  settings.keyboardShortcuts
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="mt-4 flex min-w-0 items-center gap-2 text-[10px] text-slate-400">
            <Languages size={14} className="shrink-0" />
            <span className="min-w-0">
              Language preferences are saved with your settings.
            </span>
          </div>
        </section>

        {/* Account */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm dark:border-red-950 dark:bg-slate-800">
          <div className="flex min-w-0 items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400">
              <LogOut size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Account
              </h3>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                Sign out of your EduPilot account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950"
            >
              {isLoggingOut ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LogOut size={14} />
              )}
              {isLoggingOut ? 'Signing out' : 'Logout'}
            </button>
          </div>
        </section>
      </div>

      {/* Sticky Actions */}
      <div className="sticky bottom-0 z-10 flex min-w-0 gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.04)] backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving || isLoggingOut}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          <RotateCcw size={15} className="shrink-0" />
          Reset
        </button>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isLoggingOut}
          className="flex min-w-0 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50 dark:shadow-none"
        >
          {isSaving ? (
            <Loader2 size={15} className="shrink-0 animate-spin" />
          ) : (
            <Save size={15} className="shrink-0" />
          )}
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
 