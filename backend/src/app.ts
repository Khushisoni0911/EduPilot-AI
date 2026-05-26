/**
 * Express Application Configuration
 *
 * This file creates and configures the Express app.
 * It's separate from server.ts to allow:
 * - Easy testing (import app without starting a server)
 * - Clean separation of configuration from startup
 */

import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

// ============================================
// App Factory Function
// ============================================

/**
 * Creates and configures the Express application.
 * Returns the configured app (async for future DB connection setup).
 */
export async function createApp(): Promise<Express> {
  const app = express();

  // ============================================
  // Security Middleware
  // ============================================

  /**
   * Helmet: Sets security-related HTTP headers automatically.
   * Protects against common web vulnerabilities.
   * ALWAYS use in production.
   */
  app.use(helmet());

  /**
   * CORS: Cross-Origin Resource Sharing.
   * Our Chrome extension is a different "origin" from our backend,
   * so we must explicitly allow it.
   */
  app.use(
    cors({
      origin: [
        // Chrome extension IDs (will be set in later modules)
        /^chrome-extension:\/\/.*/,
        // Development frontend
        'http://localhost:3000',
        'http://localhost:5173',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true, // Allow cookies for auth
    })
  );

  // ============================================
  // Request Parsing Middleware
  // ============================================

  // Parse JSON request bodies
  app.use(express.json({ limit: '10mb' })); // 10mb for page content

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ============================================
  // Routes (Placeholder — implemented in future modules)
  // ============================================

  // Health check endpoint — always useful
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'ai-student-assistant-backend',
    });
  });

  // API v1 routes — will be added in future modules
  // app.use('/api/v1/auth', authRoutes);
  // app.use('/api/v1/ai', aiRoutes);
  // app.use('/api/v1/notes', notesRoutes);

  // ============================================
  // 404 Handler
  // ============================================

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      statusCode: 404,
    });
  });

  return app;
}