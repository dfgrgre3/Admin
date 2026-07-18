import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const projectRoot = join(__dirname, "..");
const appDir = join(projectRoot, "src", "app");
const routeFilePattern = /-(?:backup|new|enhanced|improved)\.(?:ts|tsx)$/;
const errors: string[] = [];
const warnings: string[] = [];

function walk(dir: string, visit: (filePath: string) => void) {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      walk(filePath, visit);
      continue;
    }

    visit(filePath);
  }
}

if (!existsSync(appDir)) {
  errors.push("src/app was not found. This project expects a Next.js App Router layout.");
} else {
  walk(appDir, (filePath) => {
    if (routeFilePattern.test(filePath)) {
      errors.push(
        `Legacy or experimental route-adjacent file found: ${relative(projectRoot, filePath)}`
      );
    }
  });
}

const requiredScriptTargets = [
  "scripts/check-server.js",
  "scripts/check-environment.ts",
  "scripts/comprehensive-error-check.ts",
];

for (const target of requiredScriptTargets) {
  if (!existsSync(join(projectRoot, target))) {
    errors.push(`Missing package script target: ${target}`);
  }
}

const optionalWorkspaceDirs = ["frontend", "shared"];
for (const dir of optionalWorkspaceDirs) {
  if (!existsSync(join(projectRoot, dir))) {
    warnings.push(`${dir}/ is not present; treating this checkout as a single Next.js app.`);
  }
}

for (const warning of warnings) {
  console.warn(`Warning: ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`Error: ${error}`);
  }
  process.exit(1);
}

console.log("Structural error check completed.");
