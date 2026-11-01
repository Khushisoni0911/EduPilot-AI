/**
 * Context Menu Integration
 *
 * Adds right-click menu options when the user selects text.
 * This is a professional feature that makes the extension
 * feel native to the browser.
 *
 * MENU STRUCTURE:
 * Right-click → [EduPilot AI ▶]
 *                 ├── 💡 Explain Selection
 *                 ├── 📝 Summarize Selection
 *                 ├── ❓ Quiz from Selection
 *                 ├── 📖 Define Word/Phrase
 *                 └── 🔖 Save as Note
 */

export function setupContextMenu(): void {
  // Remove existing menus first (prevents duplicates on reinstall)
  chrome.contextMenus.removeAll();

  // Parent menu item
  chrome.contextMenus.create({
    id: 'edupilot-parent',
    title: '🎓 EduPilot AI',
    contexts: ['selection'], // Only show when text is selected
  });

  // Child menu items
  const menuItems: Array<{
    id: string;
    title: string;
    parentId: string;
  }> = [
    { id: 'edupilot-explain', title: '💡 Explain Selection', parentId: 'edupilot-parent' },
    { id: 'edupilot-summarize', title: '📝 Summarize Selection', parentId: 'edupilot-parent' },
    { id: 'edupilot-quiz', title: '❓ Generate Quiz from Selection', parentId: 'edupilot-parent' },
    { id: 'edupilot-define', title: '📖 Define Word/Phrase', parentId: 'edupilot-parent' },
    { id: 'edupilot-separator', title: '---------', parentId: 'edupilot-parent' },
    { id: 'edupilot-save-note', title: '🔖 Save as Note', parentId: 'edupilot-parent' },
  ];

  menuItems.forEach((item) => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      parentId: item.parentId,
      contexts: ['selection'],
      // Separator uses 'separator' type
      ...(item.id === 'edupilot-separator' ? { type: 'separator' as const } : {}),
    });
  });

  console.info('[ContextMenu] Context menus registered');
}

/**
 * Handle context menu item clicks.
 * Routes the action + selected text to the content script.
 */
export function setupContextMenuClickHandler(): void {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id || !info.selectionText) return;

    const actionMap: Record<string, string> = {
      'edupilot-explain': 'explain-selection',
      'edupilot-summarize': 'summarize-selection',
      'edupilot-quiz': 'quiz-from-selection',
      'edupilot-define': 'define-word',
      'edupilot-save-note': 'save-as-note',
    };

    const action = actionMap[info.menuItemId as string];
    if (!action) return;

    console.info(`[ContextMenu] "${action}" triggered on: "${info.selectionText.slice(0, 50)}"`);

    // Store the action for the sidebar to process
    await chrome.storage.session.set({
      pendingAction: {
        action,
        selectedText: info.selectionText,
        url: info.pageUrl,
        pageTitle: tab.title,
        timestamp: Date.now(),
      },
    });

    // Open the sidebar
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'OPEN_SIDEBAR',
        payload: { panel: action.replace('-selection', '').replace('-word', '') },
      });
    } catch {
      console.warn('[ContextMenu] Could not open sidebar — content script may not be ready');
    }
  });
}