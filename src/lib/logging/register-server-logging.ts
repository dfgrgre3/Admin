/**
 * Server-only ELK logging registration.
 *
 * This module is the ONLY place that statically imports the server-only
 * `elk-logger` module. It is imported exclusively from server-side code
 * (currently `src/instrumentation.ts`). Because `unified-logger` no longer
 * imports `./elk-logger`, the `server-only` dependency (and winston /
 * @elastic/elasticsearch) stays out of the client bundle graph, which fixes
 * the Turbopack/Webpack "You're importing a module that depends on
 * server-only" error.
 */

import 'server-only';

import { elkLogger } from './elk-logger';
import { logger } from './unified-logger';

/**
 * Wire the server-only ELK logger into the shared unified logger singleton.
 * Safe to call multiple times.
 */
export function registerServerLogging(): void {
  logger.registerELKLogger(elkLogger);
}
