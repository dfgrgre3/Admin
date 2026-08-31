/**
 * Admin route permission coverage check.
 *
 * Every `/admin/**` page route and every `/api/admin/**` proxy route MUST be
 * covered by an explicit rule in `ADMIN_PATH_RULES` / `ADMIN_API_RULES`
 * (src/lib/admin-panel-route-access.ts). Routes that fall through to the
 * `ADMIN_BYPASS` (`*:*`) default are a silent misconfiguration risk: they
 * lock out granular admins on new pages, or grant `*:*` semantics to a route
 * nobody reviewed.
 *
 * This script fails (exit 1) when any discovered route has no explicit rule.
 * Run it in CI / pre-merge. Usage:
 *   tsx scripts/check-admin-route-coverage.ts
 */
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import {
  ADMIN_API_RULES,
  ADMIN_PATH_RULES,
} from "../src/lib/admin-panel-route-access";

const APP_DIR = join(process.cwd(), "src", "app");

function collectRouteFiles(rootDir: string, fileName: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip Next.js private folders (e.g. _components) — they never produce routes.
        if (entry.name.startsWith("_")) continue;
        walk(full);
      } else if (entry.name === fileName) {
        out.push(full);
      }
    }
  };
  walk(rootDir);
  return out;
}

/** Converts an App Router file path to a concrete URL path pattern. */
function toRoutePattern(filePath: string): string {
  const rel = relative(APP_DIR, filePath).split(sep).join("/");
  // Drop "page.tsx" / "route.ts" and the "(admin)" route group marker.
  const segments = rel
    .split("/")
    .filter((s) => s !== "page.tsx" && s !== "route.ts" && !s.startsWith("("));
  return (
    "/" +
    segments
      .map((s) => {
        if (/^\[\.\.\..+\]$/.test(s)) return ".+"; // catch-all [...slug]
        if (/^\[\[.+\]\]$/.test(s)) return "[^/]*"; // optional [[slug]]
        if (/^\[.+\]$/.test(s)) return "[^/]+"; // dynamic [id]
        return s;
      })
      .join("/")
  );
}

/**
 * Instantiates a route pattern with concrete sample values so rule regexes
 * (which expect real URLs like /admin/users/abc123/edit) can be tested.
 * Dynamic [id] → "x", catch-all [...slug] → "x/y", optional [[slug]] → "x".
 *
 * NOTE: replacements are done on the whole string (never `split("/")`) —
 * the `[^/]` token itself contains a slash and must stay intact.
 */
function instantiateRoute(pattern: string): string {
  return pattern
    // Regex-shaped tokens produced by toRoutePattern().
    .replace(/\[\^\/\]\*/g, "x") // [^/]*  (optional dynamic)
    .replace(/\[\^\/\]\+/g, "x") // [^/]+  (dynamic segment)
    .replace(/\/\.\+(?=\/|$)/g, "/x/y") // .+  (catch-all)
    // Raw App Router markers.
    .replace(/\[\.\.\.[^\]]+\]/g, "x/y") // [...slug]
    .replace(/\[\[[^\]]+\]\]/g, "x") // [[slug]]
    .replace(/\[[^\]/]+\]/g, "x"); // [slug]
}

/**
 * Auth endpoints are exempt from *permission* gating by design: they are
 * pre-auth (gated by the credentials themselves, plus the middleware token
 * requirement) or self-service 2FA. NOTE: `login` / `verify-login` /
 * `password-reset` under /api/admin/auth are unreachable today (middleware
 * 401s them before a session exists; the real staff login proxies through
 * `/api/auth/admin-login`) — flagged for deletion, see analysis.
 */
const PERMISSION_EXEMPT_API_PREFIXES: RegExp[] = [/^\/api\/admin\/auth\//];

function main() {
  const problems: string[] = [];
  let pagesChecked = 0;
  let apiChecked = 0;

  // ── 1. Admin PAGE routes must match an ADMIN_PATH_RULES entry ────────────
  const adminPagesDir = join(APP_DIR, "(admin)", "admin");
  for (const file of collectRouteFiles(adminPagesDir, "page.tsx")) {
    pagesChecked++;
    const route = instantiateRoute(toRoutePattern(file));
    const matched = ADMIN_PATH_RULES.some((r) => r.pattern.test(route));
    if (!matched) {
      problems.push(
        `[page] ${route}  →  falls through to ADMIN_BYPASS (*:*)\n        file: ${relative(process.cwd(), file)}`,
      );
    }
  }

  // ── 2. Admin API PROXY routes must match an ADMIN_API_RULES entry ────────
  for (const file of collectRouteFiles(join(APP_DIR, "api", "admin"), "route.ts")) {
    apiChecked++;
    const route = instantiateRoute(toRoutePattern(file));
    if (PERMISSION_EXEMPT_API_PREFIXES.some((re) => re.test(route))) continue;
    const matched = ADMIN_API_RULES.some((r) => r.pattern.test(route));
    if (!matched) {
      problems.push(
        `[api ] ${route}  →  falls through to ADMIN_BYPASS (*:*)\n        file: ${relative(process.cwd(), file)}`,
      );
    }
  }

  console.log(`Checked ${pagesChecked} admin page routes and ${apiChecked} admin API proxy routes.`);
  if (problems.length > 0) {
    console.error(
      `\n✗ ${problems.length} route(s) have NO explicit permission rule ` +
        `(they silently require admin:bypass / *:*):\n`,
    );
    console.error(problems.join("\n"));
    console.error(
      "\nFix: add an explicit rule to ADMIN_PATH_RULES / ADMIN_API_RULES " +
        "in src/lib/admin-panel-route-access.ts (most specific patterns first).",
    );
    process.exit(1);
  }
  console.log("✓ All admin routes are covered by explicit permission rules.");
}


main();
