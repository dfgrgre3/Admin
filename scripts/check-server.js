const http = require("node:http");
const https = require("node:https");

const target = process.env.PERF_TARGET_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const client = target.startsWith("https:") ? https : http;

const request = client.get(target, { timeout: 5000 }, (response) => {
  response.resume();

  if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
    console.log(`Server responded at ${target} with ${response.statusCode}.`);
    return;
  }

  console.error(`Server at ${target} responded with ${response.statusCode}.`);
  process.exitCode = 1;
});

request.on("timeout", () => {
  request.destroy(new Error(`Timed out waiting for ${target}.`));
});

request.on("error", (error) => {
  console.error(`Unable to reach ${target}: ${error.message}`);
  process.exitCode = 1;
});
