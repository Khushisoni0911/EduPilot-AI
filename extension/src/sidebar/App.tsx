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

import React, { useState, useCallback } from 'react';

import SidebarContainer from './components/SidebarContainer';
import SidebarHeader from './components/SidebarHeader';
import SidebarNav from './components/SidebarNav';
import SummaryPanel from './panels/SummaryPanel';
import QuizPanel from './panels/QuizPanel';
import NotesPanel from './panels/NotesPanel';
import type { SidebarPanel } from '../shared/types';

// ============================================
// Props Interface
// ============================================

interface SidebarAppProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// Component
// ============================================

const SidebarApp: React.FC<SidebarAppProps> = ({ isOpen, onClose }) => {
  const [activePanel, setActivePanel] = useState<SidebarPanel>('summary');

  const handlePanelChange = useCallback((panel: SidebarPanel) => {
    setActivePanel(panel);
  }, []);

  if (!isOpen) return null;

  return (
    <SidebarContainer>
      {/* Header */}
      <SidebarHeader onClose={onClose} />

      {/* Navigation */}
      <SidebarNav activePanel={activePanel} onPanelChange={handlePanelChange} />

      {/* Active Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activePanel === 'summary' && <SummaryPanel />}
        {activePanel === 'quiz' && <QuizPanel />}
        {activePanel === 'notes' && <NotesPanel />}
      </div>
    </SidebarContainer>
  );
};

export default SidebarApp;