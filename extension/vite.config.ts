import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite Multi-Entry Configuration for Chrome Extension MV3
 *
 * Chrome extensions require MULTIPLE separate JavaScript bundles:
 * ┌─────────────────┬──────────────────────────────────────────┐
 * │ Entry Point     │ Purpose                                  │
 * ├─────────────────┼──────────────────────────────────────────┤
 * │ popup           │ The popup mini-app (React)               │
 * │ sidebar         │ The injected sidebar (React)             │
 * │ content/index   │ Content script (runs on web pages)       │
 * │ background/index│ Service worker (background tasks)        │
 * └─────────────────┴──────────────────────────────────────────┘
 *
 * Each gets compiled to its OWN .js file in the dist/ folder.
 * They share chunks but have separate entry points.
 */
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // '@/component' resolves to 'src/component'
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // Source maps only in development for debugging
    sourcemap: process.env.NODE_ENV !== 'production',

    rollupOptions: {
      input: {
        // ── React Apps ──────────────────────────────
        popup: resolve(__dirname, 'popup.html'),
        sidebar: resolve(__dirname, 'sidebar.html'),

        // ── Extension Scripts ────────────────────────
        'content/index': resolve(__dirname, 'src/content/index.ts'),
        'background/index': resolve(__dirname, 'src/background/index.ts'),
      },

      output: {
        // Named entry files (no hash — Chrome needs predictable filenames)
        entryFileNames: '[name].js',

        // Shared chunks (libraries like React shared between popup + sidebar)
        chunkFileNames: 'assets/chunks/[name]-[hash].js',

        // Static assets (CSS, images)
        assetFileNames: (assetInfo) => {
          // Put CSS files in the styles directory
          if (assetInfo.name?.endsWith('.css')) {
            return 'styles/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },

    // Extension popup + sidebar are small; set appropriate limit
    chunkSizeWarningLimit: 1500,

    // Minify for smaller extension size
    minify: process.env.NODE_ENV === 'production',
  },

  // Development server (only used for popup/sidebar isolated development)
  server: {
    port: 3000,
    open: false,
  },
});