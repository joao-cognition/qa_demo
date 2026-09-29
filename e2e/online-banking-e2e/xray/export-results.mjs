#!/usr/bin/env node
// Converts a Playwright JSON report into the Xray Cloud "import execution results"
// JSON shape. Tests are matched to Xray test keys through the `xray` annotation
// on each test. Without XRAY_CLIENT_ID / XRAY_CLIENT_SECRET it writes the payload
// to xray/last-export.json and stops, so the mapping can be reviewed before
// anything is posted. Wire the credentials through CI secrets, never in the repo.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const reportPath = process.argv[2] || resolve(here, "../test-results/results.json");
const report = JSON.parse(readFileSync(reportPath, "utf8"));

const statusMap = { passed: "PASSED", failed: "FAILED", timedOut: "FAILED", skipped: "TODO", interrupted: "ABORTED" };
const tests = [];

function walk(suite) {
  for (const spec of suite.specs ?? []) {
    const key = spec.annotations?.find((a) => a.type === "xray")?.description
      ?? spec.tests?.[0]?.annotations?.find((a) => a.type === "xray")?.description;
    for (const t of spec.tests ?? []) {
      const last = t.results.at(-1);
      tests.push({
        testKey: key ?? null,
        title: spec.title,
        project: t.projectName,
        status: statusMap[last?.status] ?? "TODO",
        comment: last?.error?.message?.split("\n")[0] ?? "",
        start: last?.startTime,
        durationMs: last?.duration,
      });
    }
  }
  for (const child of suite.suites ?? []) walk(child);
}
for (const s of report.suites ?? []) walk(s);

const unmapped = tests.filter((t) => !t.testKey);
const payload = {
  info: {
    summary: `Automated run ${new Date().toISOString().slice(0, 16)}`,
    description: `Playwright, projects: ${[...new Set(tests.map((t) => t.project))].join(", ")}`,
    testPlanKey: process.env.XRAY_TEST_PLAN_KEY || undefined,
    testEnvironments: [...new Set(tests.map((t) => t.project))],
  },
  tests: tests
    .filter((t) => t.testKey)
    .map((t) => ({ testKey: t.testKey, status: t.status, comment: `${t.project}: ${t.comment}`.trim() })),
};

writeFileSync(resolve(here, "last-export.json"), JSON.stringify(payload, null, 2));
console.log(`${payload.tests.length} results mapped to Xray keys; ${unmapped.length} tests have no xray annotation.`);
for (const t of unmapped) console.log(`  unmapped: ${t.title}`);

if (!process.env.XRAY_CLIENT_ID || !process.env.XRAY_CLIENT_SECRET) {
  console.log("XRAY_CLIENT_ID / XRAY_CLIENT_SECRET not set: wrote xray/last-export.json and did not post.");
  process.exit(0);
}

const base = process.env.XRAY_BASE_URL || "https://xray.cloud.getxray.app";
const auth = await fetch(`${base}/api/v2/authenticate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ client_id: process.env.XRAY_CLIENT_ID, client_secret: process.env.XRAY_CLIENT_SECRET }),
});
const token = (await auth.text()).replace(/"/g, "");
const res = await fetch(`${base}/api/v2/import/execution`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify(payload),
});
console.log(res.status, await res.text());
