const fs = require("fs");
const path = "d:\\admin\\src\\app\\(admin)\\admin\\anti-cheat\\_components\\types.ts";

let s = fs.readFileSync(path, "utf8");
if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
const over = [];
for (let i = 0; i < s.length; i++) {
  if (s.charCodeAt(i) > 0xff) over.push([i, s.charCodeAt(i), s.slice(i - 20, i + 5)]);
}
if (over.length > 0) {
  console.error("Non-latin1 chars found, aborting. Count:", over.length);
  console.error(over.slice(0, 5));
  process.exit(1);
}
const buf = Buffer.from(s, "latin1");
const recovered = buf.toString("utf8");
if (recovered.includes("\uFFFD")) {
  console.error("Recovery produced invalid UTF-8 — aborting.");
  process.exit(1);
}
fs.writeFileSync(path, recovered, "utf8");
console.log("Written OK. Length:", recovered.length);
console.log("Sample:", JSON.stringify(recovered.split("label: ")[1] ? recovered.split("label: ")[1].slice(0, 20) : ""));