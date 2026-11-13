#!/usr/bin/env node
/**
 * Runs the full QA suite against a running server.
 *   npm run dev        (in another terminal)
 *   npm test
 */
import { spawnSync } from "node:child_process";

const steps = [
  { name: "Database integrity", cmd: "node", args: ["scripts/verify-db.mjs"] },
  { name: "Route smoke tests", cmd: "node", args: ["scripts/qa-e2e.mjs"] },
  { name: "Business logic flows", cmd: "node", args: ["scripts/qa-flows.mjs"] },
  { name: "Browser action flows", cmd: "node", args: ["scripts/qa/actions.mjs"] },
];

let failed = 0;
for (const step of steps) {
  console.log(`\n\u2500\u2500 ${step.name} ${"\u2500".repeat(Math.max(0, 46 - step.name.length))}`);
  const res = spawnSync(step.cmd, step.args, { stdio: "inherit", env: process.env });
  if (res.status !== 0) failed += 1;
}

console.log(`\n${failed === 0 ? "All suites passed." : `${failed} suite(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);
