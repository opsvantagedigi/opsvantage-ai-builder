import { spawnSync } from "node:child_process";

function parseAuditJson(output) {
  const start = output.indexOf("{");
  if (start < 0) {
    throw new Error("npm audit output did not contain JSON payload");
  }
  const jsonText = output.slice(start);
  return JSON.parse(jsonText);
}

const result = spawnSync("npm", ["audit", "--json"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});

const stdout = result.stdout || "";
const stderr = result.stderr || "";
const merged = `${stdout}\n${stderr}`;

let report;
try {
  report = parseAuditJson(merged);
} catch (error) {
  console.error("Failed to parse npm audit JSON output.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}

const counts = report?.metadata?.vulnerabilities || {};
const critical = Number(counts.critical || 0);
const high = Number(counts.high || 0);
const moderate = Number(counts.moderate || 0);
const low = Number(counts.low || 0);

console.log("Security Audit Summary");
console.log(`- Critical: ${critical}`);
console.log(`- High: ${high}`);
console.log(`- Moderate: ${moderate}`);
console.log(`- Low: ${low}`);

if (critical > 0 || high > 0) {
  console.error("Audit gate failed: high/critical vulnerabilities detected.");
  process.exit(1);
}

console.log("Audit gate passed: no high/critical vulnerabilities detected.");
process.exit(0);
