/**
 * Sidebar Entry Point
 *
 * NOTE: This file is the Vite entry point for the sidebar bundle.
 * In production, the sidebar is NOT opened directly via this file.
 * Instead, sidebar-injector.ts uses React directly to mount SidebarApp.
 *
 * This file IS used for:
 * - Isolated sidebar development (load sidebar.html in browser)
 * - Vite to bundle the sidebar React app
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

import SidebarApp from './App';
import '../styles/globals.css';

// For isolated development only
const rootElement = document.getElementById('ai-sidebar-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SidebarApp isOpen={true} onClose={() => console.info('Close clicked')} />
    </React.StrictMode>
  );
}