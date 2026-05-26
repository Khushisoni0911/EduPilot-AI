/**
 * Summary Panel — Scaffold
 * Will be fully implemented in Module 5 (AI Integration).
 * Currently shows the UI structure with placeholder states.
 */

import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

const SummaryPanel: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {/* Icon */}
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <FileText size={24} className="text-blue-500" />
      </div>

      {/* Title */}
      <h2 className="text-gray-800 font-semibold text-base mb-2">
        AI Summarization
      </h2>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
        Get an intelligent summary of the current page. Highlight key points, extract main ideas.
      </p>

      {/* Coming in Module 5 badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full">
        <Sparkles size={12} className="text-purple-500" />
        <span className="text-xs text-purple-600 font-medium">
          AI features coming in Module 5
        </span>
      </div>
    </div>
  );
};

export default SummaryPanel;