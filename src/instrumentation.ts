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
    const { sendWebhookAlert } = await import('./lib/alerting/webhook-alert');
    registerServerLogging();

    try {
      const validation = ensureValidEnvironment({ fatal: false });

      // Non-fatal validation failures (e.g. missing/short JWT_SECRET) would
      // otherwise only show up in logs. Alert externally in production so a
      // silently degraded system is never missed.
      if (!validation.valid) {
        logger.error('CRITICAL: Environment validation reported errors; running in degraded mode', undefined, {
          errors: validation.errors,
        });
        await sendWebhookAlert({
          title: 'Environment validation failed (degraded mode)',
          message: validation.errors.join(' | '),
          level: 'critical',
          fields: {
            environment: process.env.NODE_ENV ?? 'development',
            errorCount: String(validation.errors.length),
          },
        });
      }

      logger.info('[Instrumentation] Environment validated; background workers are managed by the Go backend.');
    } catch (error) {
      // Keep the process alive; platform lifecycle and request boundaries handle degraded startup safely.
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.error('CRITICAL: System Startup Failed; running in degraded mode', normalizedError);
      await sendWebhookAlert({
        title: 'System startup failed (degraded mode)',
        message: normalizedError.message,
        level: 'critical',
        fields: {
          environment: process.env.NODE_ENV ?? 'development',
          stack: normalizedError.stack ?? 'no stack trace',
        },
      });
    }
  }
}
