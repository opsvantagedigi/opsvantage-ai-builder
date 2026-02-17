import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const suiteName = "TestSuite_Enterprise_V1";
const reportDir = resolve(process.cwd(), ".opsvantage");
const reportPath = resolve(reportDir, "test-suite-enterprise-v1.json");

function run(command, args) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });

    child.on("close", (code) => {
      resolveRun(code ?? 1);
    });

    child.on("error", () => {
      resolveRun(1);
    });
  });
}

const checks = [
  { name: "Build", command: "npm", args: ["run", "build"] },
  { name: "Jest", command: "npm", args: ["run", "test:jest"] },
];

const startedAt = new Date().toISOString();
const results = [];

for (const check of checks) {
  const exitCode = await run(check.command, check.args);
  const status = exitCode === 0 ? "PASS" : "FAIL";
  results.push({
    check: check.name,
    status,
    exitCode,
  });

  if (exitCode !== 0) {
    break;
  }
}

const allPassed = results.length === checks.length && results.every((item) => item.status === "PASS");

const report = {
  suite: suiteName,
  startedAt,
  finishedAt: new Date().toISOString(),
  total: checks.length,
  passed: results.filter((item) => item.status === "PASS").length,
  failed: results.filter((item) => item.status === "FAIL").length,
  accuracy: allPassed ? 100 : Number(((results.filter((item) => item.status === "PASS").length / checks.length) * 100).toFixed(2)),
  status: allPassed ? "PASS" : "FAIL",
  videoLinkUnlocked: allPassed,
  results,
};

mkdirSync(reportDir, { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

console.log(`\n${suiteName} => ${report.status} (${report.accuracy}%)`);
console.log(`Report: ${reportPath}`);

process.exit(allPassed ? 0 : 1);
