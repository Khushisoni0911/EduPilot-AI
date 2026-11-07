/**
 * Server Entry Point
 *
 * This is the first file Node.js executes.
 * It's responsible for:
 * 1. Loading environment variables
 * 2. Starting the Express app
 * 3. Connecting to MongoDB
 * 4. Handling uncaught errors gracefully
 *
 * Following the principle of separation of concerns:
 * - server.ts = startup logic
 * - app.ts = Express configuration
 */

import 'dotenv/config'; // Must be first — loads .env before anything else

import { createApp } from './src/app';
import {
  connectDatabase,
  disconnectDatabase,
} from './src/config/database';

// ============================================
// Environment Validation
// ============================================

/**
 * Validate critical environment variables before starting.
 * Better to crash immediately with a clear message than
 * fail silently later in a confusing way.
 */
const requiredEnvVars = [ 'MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`[Server] ❌ Missing required environment variable: ${envVar}`);
    console.error('[Server] Check your .env file against .env.example');
    process.exit(1); // Exit with error code
  }
}

// ============================================
// Server Startup
// ============================================

const PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = '0.0.0.0';
async function startServer(): Promise<void> {
  try {
        // Connect to MongoDB before starting the server
    await connectDatabase();
    // Create the Express app (defined in app.ts)
    const app = await createApp();

    // Start listening for requests
    const server = app.listen(PORT, HOST, () => {
      console.info(`
╔══════════════════════════════════════════╗
║     AI Student Assistant — Backend       ║
╠══════════════════════════════════════════╣
║  Status:  🟢 Running                     ║
║  Port:    ${PORT}                            ║
║  Mode:    ${process.env.NODE_ENV || 'development'}                  ║
║  Version: 1.0.0                          ║
╚══════════════════════════════════════════╝
      `);
    });

    // ============================================
    // Graceful Shutdown Handling
    // ============================================

    /**
     * Graceful shutdown ensures:
     * - Existing requests are completed before shutdown
     * - Database connections are properly closed
     * - No data is lost during deployment updates
     *
     * This is ESSENTIAL for production applications.
     */
    const gracefulShutdown = (signal: string) => {
      console.info(`\n[Server] ${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.info('[Server] HTTP server closed');
        // Database disconnection will be added when we setup MongoDB
        // Disconnect MongoDB gracefully
await disconnectDatabase();

console.info('[Server] ✅ Graceful shutdown complete');
process.exit(0);
      });

      // Force close after 30 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('[Server] Could not close connections in time, forcing shutdown');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] ❌ Failed to start server:', error);
    process.exit(1);
  }
}

// ============================================
// Global Error Handlers
// ============================================

/**
 * Catch unhandled Promise rejections.
 * These happen when you forget to .catch() a promise.
 */
process.on('unhandledRejection', (reason: unknown, promise) => {
  console.error('[Server] Unhandled Promise Rejection:', reason);
  console.error('[Server] Promise:', promise);
  // In production, you'd send this to a logging service (Sentry, etc.)
});

/**
 * Catch uncaught synchronous exceptions.
 */
process.on('uncaughtException', (error: Error) => {
  console.error('[Server] Uncaught Exception:', error);
  process.exit(1); // Always exit after uncaught exception
});

// Bootstrap the server
startServer();