/**
* Environment Variables Validation
* Validates all required environment variables at startup
*/

import { logger } from './logger';

const REQUIRED_ENV_VARS = {
  production: ['DATABASE_URL']
} as const;

const MIN_JWT_SECRET_LENGTH = 32;

interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate JWT_SECRET format and security
 */
function validateJWTSecret(): {valid: boolean;error?: string;} {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return {
      valid: false,
      error: 'JWT_SECRET is not set in environment variables'
    };
  }

  // Check for default/unsafe values
  const unsafeValues = [
  'your-secret-key',
  'fallback-jwt-secret-for-dev-only',
  'secret',
  'password',
  'changeme'];


  if (unsafeValues.includes(jwtSecret)) {
    return {
      valid: false,
      error: 'JWT_SECRET is using an unsafe default value. Please set a secure random secret.'
    };
  }

  // Check minimum length
  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    return {
      valid: false,
      error: `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long. Current length: ${jwtSecret.length}`
    };
  }

  return { valid: true };
}

function checkJwtValidation(errors: string[], warnings: string[], isProduction: boolean) {
  const jwtValidation = validateJWTSecret();
  if (!jwtValidation.valid) {
    if (isProduction) {
      errors.push(jwtValidation.error!);
    } else {
      warnings.push(jwtValidation.error! + ' (Development mode - should be fixed before production)');
    }
  }
}

function checkProductionVars(errors: string[], isProduction: boolean) {
  if (isProduction) {
    for (const envVar of REQUIRED_ENV_VARS.production) {
      if (!process.env[envVar]) {
        errors.push(`Required environment variable ${envVar} is not set`);
      }
    }
  }
}

function checkDatabaseUrl(errors: string[], isProduction: boolean) {
  if (process.env.DATABASE_URL) {
    try {
      new URL(process.env.DATABASE_URL);
    } catch {
      errors.push('DATABASE_URL is not a valid URL format');
    }
  } else if (isProduction) {
    errors.push('DATABASE_URL is required in production');
  }
}

function checkSessionDuration(warnings: string[]) {
  if (process.env.SESSION_DURATION) {
    const duration = parseInt(process.env.SESSION_DURATION, 10);
    if (isNaN(duration) || duration < 60) {
      warnings.push('SESSION_DURATION should be at least 60 seconds');
    }
  }
}

function checkBaseUrl(warnings: string[]) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_BASE_URL);
    } catch {
      warnings.push('NEXT_PUBLIC_BASE_URL is not a valid URL format');
    }
  }
}

/**
 * Validate all environment variables
 */
function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  checkJwtValidation(errors, warnings, isProduction);
  checkProductionVars(errors, isProduction);
  checkDatabaseUrl(errors, isProduction);
  checkSessionDuration(warnings);
  checkBaseUrl(warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

interface EnsureEnvironmentOptions {
  fatal?: boolean;
}

export function ensureValidEnvironment(options: EnsureEnvironmentOptions = {}): void {
  const fatal = options.fatal ?? process.env.NODE_ENV === 'production';
  const result = validateEnvironment();

  // Log warnings
  if (result.warnings.length > 0) {
    logger.warn('Environment variable warnings', { warnings: result.warnings });
    result.warnings.forEach((warning) => {
      logger.warn(`Environment warning: ${warning}`);
    });
  }

  // Throw on errors in production
  if (!result.valid) {
    logger.error('Environment validation failed', undefined, { errors: result.errors });
    result.errors.forEach((error) => {
      logger.error(`Environment error: ${error}`);
    });

    if (fatal) {
      throw new Error(
        'Environment validation failed. Please fix the errors above before starting the application.'
      );
    }
  }
}