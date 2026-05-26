import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

const NotesPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
      <BookOpen size={24} className="text-amber-500" />
    </div>
    <h2 className="text-gray-800 font-semibold text-base mb-2">Your Notes</h2>
    <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">
      All your saved notes and AI-generated highlights will appear here.
    </p>
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full">
      <Sparkles size={12} className="text-purple-500" />
      <span className="text-xs text-purple-600 font-medium">Coming in Module 6</span>
    </div>
  </div>
);

export default NotesPage;