import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

const SettingsPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
      <Settings size={24} className="text-gray-500" />
    </div>
    <h2 className="text-gray-800 font-semibold text-base mb-2">Settings</h2>
    <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">
      Configure your AI assistant preferences, theme, and shortcuts.
    </p>
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full">
      <Sparkles size={12} className="text-purple-500" />
      <span className="text-xs text-purple-600 font-medium">Coming in Module 4</span>
    </div>
  </div>
);

export default SettingsPage;