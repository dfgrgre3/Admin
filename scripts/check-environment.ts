import { ensureValidEnvironment } from "../src/lib/env-validation";

ensureValidEnvironment({ fatal: true });

console.log("Environment validation completed.");
