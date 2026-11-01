/**
 * Content Script — Main Entry Point (Module 3 Update)
 *
 * This is the orchestrator. It:
 * 1. Creates all the subsystem instances
 * 2. Wires them together
 * 3. Starts listening for events
 * 4. Sets up cleanup on page unload
 *
 * ARCHITECTURE NOTE:
 * We use a "composition root" pattern here.
 * All dependencies are created HERE and passed into the classes
 * that need them. Classes don't create their own dependencies —
 * they receive them. This makes the code testable and modular.
 */
import '../styles/sidebar.css';
import { EventManager } from './dom/EventManager';
import { MutationManager } from './dom/MutationManager';
import { SelectionDetector } from './selection/SelectionDetector';
import { SelectionTracker } from './selection/SelectionTracker';
import { FABManager } from './fab/FABManager';
import { ContextDetector } from './context/ContextDetector';
import { ContentMessenger } from './messaging/ContentMessenger';
import { MessageRouter } from './messaging/MessageRouter';
import { injectSidebar } from './sidebar-injector';
import type { IncomingContentMessage, FABAction } from '../shared/types/messages';
import { isSupportedPage } from './dom/DOMUtils';

// ============================================
// Guard: Only run on supported pages
// ============================================

if (!isSupportedPage(window.location.href) || window.self !== window.top) {
  // Exit early for chrome:// pages, iframes, etc.
  throw new Error('[Content] Unsupported page — content script exiting');
}

// ============================================
// Composition Root
// Create all instances and wire them together
// ============================================

const eventManager = new EventManager();
const mutationManager = new MutationManager();
const messenger = new ContentMessenger();
const contextDetector = new ContextDetector();

// Selection system
const selectionDetector = new SelectionDetector(eventManager);
const selectionTracker = new SelectionTracker(messenger);

// FAB system
const fabManager = new FABManager(
  eventManager,
  (action: FABAction, selectedText: string) => {
    handleFABAction(action, selectedText);
  }
);

// Message router (receives all incoming messages)
const messageRouter = new MessageRouter({
  selectionTracker,
  contextDetector,
  fabManager,
});

// ============================================
// Initialize
// ============================================

function initialize(): void {
  console.info('[Content] Initializing on:', window.location.hostname);

  // 1. Inject sidebar into page
  injectSidebar();

  // 2. Initialize FAB
  fabManager.initialize();

  // 3. Start selection detection
  selectionDetector.start();

  // 4. Wire selection events → tracker and FAB
  selectionDetector.onSelect((data) => {
    selectionTracker.updateSelection(data);
    fabManager.onTextSelected(data);
  });

  selectionDetector.onDeselect(() => {
    selectionTracker.clearSelection();
    fabManager.onTextDeselected();
  });

  // 5. Set up message listener (incoming from popup/background)
  setupMessageListener();

  // 6. Set up SPA navigation detection
  setupSPADetection();

  // 7. Detect page context
  const context = contextDetector.detect();
  console.info('[Content] Page context detected:', context.siteType);

  // 8. Notify background that content script is ready
  notifyReady(context.siteType);

  // 9. Setup cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  console.info('[EduPilot AI] ✅ Initialization complete');
  console.info('[EduPilot AI] Event listeners active:', eventManager.count);
}

// ============================================
// Message Listener
// ============================================

function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener(
    (
      message: IncomingContentMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ) => {
      messageRouter
        .route(message)
        .then(sendResponse)
        .catch((error: Error) => {
          console.error('[EduPilot AI] Message routing error:', error);
          sendResponse({ success: false, error: error.message });
        });

      return true; // Keep channel open for async
    }
  );
}

// ============================================
// SPA Navigation Detection
// ============================================

function setupSPADetection(): void {
  // Watch for URL changes (YouTube, GitHub, etc.)
  const cleanupURLObserver = mutationManager.observeURLChanges(
    (newUrl, oldUrl) => {
      console.info('[EduPilot AI] SPA navigation detected:', oldUrl, '→', newUrl);

      // Clear context cache for new page
      contextDetector.clearCache();

      // Re-detect context after DOM settles
      setTimeout(() => {
        const newContext = contextDetector.detect();
        console.info('[EduPilot AI] New page context:', newContext.siteType);

        // Notify background of context change
        messenger.sendAndForget({
          type: 'PAGE_CONTEXT_READY',
          payload: newContext,
        });
      }, 500);
    }
  );

  // Store cleanup for later
  window.addEventListener('beforeunload', cleanupURLObserver);
}

// ============================================
// FAB Action Handler
// ============================================

function handleFABAction(action: FABAction, selectedText: string): void {
  console.info('[EduPilot AI] FAB action triggered:', action, '| Text:', selectedText.slice(0, 50));

  // Notify background of the action
  messenger.sendToBackground({
    type: 'FAB_ACTION_TRIGGERED',
    payload: {
      action,
      selectedText,
      url: window.location.href,
    },
  }).catch(console.warn);

  // Open sidebar to show the action result
  // (The actual AI processing happens in Module 5)
  import('./sidebar-injector').then(({ openSidebar }) => {
    openSidebar();
  });
}

// ============================================
// Notify Background Worker
// ============================================

function notifyReady(siteType: string): void {
  messenger
    .sendToBackground({
      type: 'CONTENT_SCRIPT_READY',
      payload: {
        url: window.location.href,
        title: document.title,
        siteType: siteType as never,
      },
    })
    .catch(() => {
      // Background might not be ready yet — that's fine
    });
}

// ============================================
// Cleanup
// ============================================

function cleanup(): void {
  console.info('[EduPilot AI] Cleaning up event listeners...');

  selectionDetector.stop();
  fabManager.destroy();
  eventManager.removeAll();
  mutationManager.disconnectAll();

  console.info('[EduPilot AI] ✅ Cleanup complete');
}

// ============================================
// Bootstrap
// ============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM already ready (script runs at document_idle by default)
  initialize();
}