/**
 * Next.js Instrumentation Hook
 * This file runs once when the application starts
 * Used for environment validation and core system health
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 1. Core Service Initialization
    const { ensureValidEnvironment } = await import('./lib/env-validation');
    const { logger } = await import('./lib/logger');
    const { registerServerLogging } = await import('./lib/logging/register-server-logging');
    registerServerLogging();

    try {
      ensureValidEnvironment({ fatal: false });

      logger.info('[Instrumentation] Environment validated; background workers are managed by the Go backend.');
    } catch (error) {
       // Keep the process alive; platform lifecycle and request boundaries handle degraded startup safely.
       logger.error('CRITICAL: System Startup Failed; running in degraded mode', error instanceof Error ? error : new Error(String(error)));
    }
  }
}
