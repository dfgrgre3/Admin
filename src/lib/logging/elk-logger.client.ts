/**
 * Client-side stub for the server-only ELK logger.
 *
 * This module is aliased to replace `./elk-logger` in the CLIENT build via
 * `next.config.js`. The real `elk-logger.ts` imports `server-only` and Node-only
 * packages (winston, @elastic/elasticsearch) which cannot be bundled for the
 * browser. Since `UnifiedLogger` never enables ELK on the client, a no-op stub
 * is sufficient and keeps those server-only imports out of the browser bundle.
 */

/* eslint-disable @typescript-eslint/no-empty-function */
const noop = (): void => {};

export const elkLogger = {
  log: noop,
  info: noop,
  warn: noop,
  error: noop,
  debug: noop,
};

export const elkLoggerHelper = {
  info: noop,
  warn: noop,
  error: noop,
  debug: noop,
  http: noop,
  db: noop,
  auth: noop,
};
