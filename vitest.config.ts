import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "node_modules/**",
      // E2E specs live in src/__tests__/e2e and are NOT unit tests — they run
      // through Playwright instead (see playwright.config.ts -> testDir).
      // Run them with:  npm run test:e2e  (or npm run test:all for both).
      "src/__tests__/e2e/**",
    ],
    pool: "threads",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
