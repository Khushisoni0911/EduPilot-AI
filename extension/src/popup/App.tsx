/**
 * Popup Application Root
 *
 * Manages popup-level state and navigation.
 * Uses a simple tab-based routing system
 * (no React Router needed for this small app).
 */

import React, { useState } from 'react';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Navigation from './components/layout/Navigation';
import HomePage from './pages/HomePage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';

// ============================================
// Types
// ============================================

type PopupPage = 'home' | 'notes' | 'settings';

// ============================================
// Component
// ============================================

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PopupPage>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'notes':
        return <NotesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="w-[400px] h-[580px] bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <Header />

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;