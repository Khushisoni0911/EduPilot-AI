/**
 * Extension Popup Entry Point
 *
 * This is where React boots up inside the Chrome extension popup.
 * It's identical to a normal React app's main.tsx — Chrome extensions
 * use standard web technology for their popup UI.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

// Import global Tailwind CSS styles
import '../styles/globals.css';

/**
 * Mount React to the #root div in popup.html
 *
 * React.StrictMode: Enables additional development warnings.
 * KEEP THIS — it catches bugs that would be silent otherwise.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    '[EduPilot AI] Fatal: Could not find #root element. Check popup.html.'
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);