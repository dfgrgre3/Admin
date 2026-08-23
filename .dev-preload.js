/**
 * Dev-server diagnostics preload.
 * Loaded via `node -r .dev-preload.js` so it installs handlers BEFORE Next boots.
 * - Logs SIGINT/SIGHUP with timestamp + stack (identifies who/when sends Ctrl events)
 * - Logs uncaughtException / unhandledRejection with FULL stacks to .dev-crash.log
 * - Ignores a stray first SIGINT so external console noise doesn't kill the dev server;
 *   a second SIGINT within 3s (a human mashing Ctrl+C) exits for real.
 */
const fs = require('fs');
const LOG = 'd:/admin/.dev-crash.log';
function w(tag, detail) {
  try {
    fs.appendFileSync(LOG, `\n=== [${new Date().toISOString()}] ${tag} ===\n${detail}\n`);
  } catch (_) { /* ignore */ }
}

let lastSigint = 0;
process.on('SIGINT', () => {
  const now = Date.now();
  w('SIGINT', 'stack: ' + new Error().stack);
  if (now - lastSigint < 3000) {
    w('SIGINT', 'second SIGINT within 3s -> exiting');
    process.exit(0);
  }
  lastSigint = now;
  // eslint-disable-next-line no-console
  console.log('\n(dev server) ignored stray Ctrl+C — press twice within 3s to stop');
});

process.on('SIGBREAK', () => w('SIGBREAK', 'stack: ' + new Error().stack));
process.on('SIGHUP', () => w('SIGHUP', 'stack: ' + new Error().stack));
process.on('uncaughtException', (e) => {
  w('uncaughtException', (e && e.stack) ? e.stack : String(e));
});
process.on('unhandledRejection', (e) => {
  w('unhandledRejection', (e && e.stack) ? e.stack : String(e));
});
