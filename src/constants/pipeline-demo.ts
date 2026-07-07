/* ==========================================================================
   AI PIPELINE DEMO — scripted execution data
   Every node, state, endpoint, agent name, timeout, and log format below is
   taken from the production system: the n8n "Generate Test Script" workflow
   + qa-ai-service (localhost:3939, /v1/invoke & /v1/run-test, Claude agents
   generate-test-script / run-and-debug-test / analyze-test-results /
   git-and-pr). Only identifiers are sanitized (ticket keys, repo, URLs).
   Durations are compressed for the demo (real runs take minutes).
   ========================================================================== */

export type StageStatus = "queued" | "running" | "passed" | "failed" | "skipped";
export type StageSystem = "n8n" | "jira" | "qa-service" | "claude" | "playwright" | "github";

export interface StageLog {
  /** 0..1 — fraction of the stage duration at which the line appears. */
  at: number;
  text: string;
  level?: "info" | "ok" | "warn" | "error";
}

export interface StageDef {
  id: string;
  /** Display name — mirrors the real n8n node names. */
  name: string;
  system: StageSystem;
  /** DAG position (x in column units, lane 0 = main, 1 = debug branch). */
  x: number;
  lane: 0 | 1;
  deps: readonly string[];
  /** Inspector overview rows. */
  detail: readonly { label: string; value: string }[];
  input?: string;
  output?: string;
  artifact?: { title: string; body: string };
}

export interface StageRun {
  stage: string;
  /** Virtual duration at 1× speed (ms). */
  duration: number;
  outcome: "passed" | "failed";
  logs: readonly StageLog[];
}

export interface Scenario {
  id: "pass" | "fail";
  label: string;
  runs: readonly StageRun[];
}

/* ------------------------------- Stages ---------------------------------- */

export const STAGES: readonly StageDef[] = [
  {
    id: "trigger",
    name: "Webhook Trigger",
    system: "n8n",
    x: 0,
    lane: 0,
    deps: [],
    detail: [
      { label: "Trigger", value: "Jira automation → POST webhook" },
      { label: "Condition", value: 'status changed → "AI Analyzing"' },
      { label: "Workflow", value: "[PIPELINE] Generate Test Script WF" },
    ],
    input: `POST /webhook/generate-test-script
{ "ticketId": "QA-1427", "event": "status_changed",
  "to": "AI Analyzing" }`,
  },
  {
    id: "fetch",
    name: "Jira: Get Ticket",
    system: "jira",
    x: 1,
    lane: 0,
    deps: ["trigger"],
    detail: [
      { label: "Method", value: "JQL filter by ticket key" },
      { label: "JQL", value: 'key = QA-1427 AND status = "AI Analyzing"' },
      { label: "Fields", value: "summary · description · AC · reporter · sprint" },
    ],
    output: `{ "key": "QA-1427",
  "summary": "Password-protected archive is not
              quarantined on upload",
  "acceptanceCriteria": 4, "reporter": "QA Lead" }`,
  },
  {
    id: "gate-meta",
    name: "Gate: untouched?",
    system: "n8n",
    x: 2,
    lane: 0,
    deps: ["fetch"],
    detail: [
      { label: "Check", value: "pipeline metadata — script not yet generated" },
      { label: "Guards against", value: "double-processing the same ticket" },
      { label: "On false", value: "skip ticket, return to queue" },
    ],
  },
  {
    id: "handoff",
    name: "Write Handoff File",
    system: "qa-service",
    x: 3,
    lane: 0,
    deps: ["gate-meta"],
    detail: [
      { label: "Path", value: ".claude/AI-debug/handoff/QA-1427.md" },
      { label: "Purpose", value: "durable contract between pipeline phases" },
      { label: "Contains", value: "normalized requirement · AC · agent mode · reporter" },
    ],
    artifact: {
      title: "handoff/QA-1427.md (excerpt)",
      body: `**Ticket:** QA-1427
**Agent Mode:** generate-test-script
**Reporter:** QA Lead

## Normalized requirement
Uploading a password-protected archive MUST
route the file to quarantine and surface a
"Password required" verdict in the UI.

## Test cases (approved in Phase I)
1. Upload pw-protected .zip → quarantined
2. Verdict badge shows "Password required"
3. Audit log records quarantine event`,
    },
  },
  {
    id: "agent-gen",
    name: "Agent: Generate Test Script",
    system: "claude",
    x: 4.2,
    lane: 0,
    deps: ["handoff"],
    detail: [
      { label: "Endpoint", value: "POST :3939/v1/invoke (timeout 900s)" },
      { label: "Agent", value: "generate-test-script.md" },
      { label: "Model", value: "claude-sonnet-4-5" },
      { label: "Context", value: "handoff file · POM inventory · repo conventions" },
      { label: "Tokens", value: "in 21,438 · out 2,847 (cache read 14,200)" },
      { label: "Cost", value: "$0.19" },
    ],
    input: `{ "agent": "generate-test-script",
  "context": { "ticketId": "QA-1427",
    "handoff": ".claude/AI-debug/handoff/QA-1427.md",
    "n8nExecId": 38412 } }`,
    artifact: {
      title: "tests/e2e/quarantine-upload.spec.ts (generated)",
      body: `import { test, expect } from "../fixtures/scan";
import { UploadPage } from "../pom/upload-page";

test.describe("QA-1427 · pw-protected archive", () => {
  test("routes archive to quarantine", async ({ page, scanApi }) => {
    const upload = new UploadPage(page);
    await upload.goto();
    await upload.submitFile("fixtures/locked.zip");

    await expect(upload.verdictBadge)
      .toHaveText("Password required");

    const item = await scanApi.findByName("locked.zip");
    expect(item.disposition).toBe("quarantined");
  });
});`,
    },
  },
  {
    id: "run-1",
    name: "Playwright: Run Test",
    system: "playwright",
    x: 5.4,
    lane: 0,
    deps: ["agent-gen"],
    detail: [
      { label: "Endpoint", value: "POST :3939/v1/run-test (timeout 31m)" },
      { label: "Spec", value: "tests/e2e/quarantine-upload.spec.ts" },
      { label: "Attempt", value: "retryCount: 0" },
      { label: "Artifacts", value: "trace.zip · video.webm · report.html" },
    ],
    input: `{ "specFile": "tests/e2e/quarantine-upload.spec.ts",
  "retryCount": 0 }`,
  },
  {
    id: "gate-pass",
    name: "Gate: Test PASS?",
    system: "n8n",
    x: 6.4,
    lane: 0,
    deps: ["run-1"],
    detail: [
      { label: "Branch TRUE", value: "post result → Git & PR" },
      { label: "Branch FALSE", value: "self-correction loop (Agent Debug)" },
      { label: "Metadata", value: "status → passed | failed" },
    ],
  },
  // ---- self-correction branch (lane 1) ----
  {
    id: "agent-debug",
    name: "Agent: Debug (self-correct)",
    system: "claude",
    x: 7.1,
    lane: 1,
    deps: ["gate-pass"],
    detail: [
      { label: "Endpoint", value: "POST :3939/v1/invoke (timeout 900s)" },
      { label: "Agent", value: "run-and-debug-test.md" },
      { label: "Model", value: "claude-sonnet-4-5" },
      { label: "Policy", value: "fix AUTOMATION bugs only · max 3 attempts" },
      { label: "Tokens", value: "in 18,902 · out 1,563" },
    ],
    input: `{ "agent": "run-and-debug-test",
  "context": { "ticketId": "QA-1427",
    "specFile": "tests/e2e/quarantine-upload.spec.ts",
    "failure": "locator('.verdict-chip') resolved 0 elements" } }`,
    artifact: {
      title: "self-correction diff",
      body: `--- a/tests/e2e/quarantine-upload.spec.ts
+++ b/tests/e2e/quarantine-upload.spec.ts
@@ pom/upload-page.ts
-  this.verdictBadge = page.locator(".verdict-chip");
+  // UI renamed chip → badge in build 4.2.1
+  this.verdictBadge =
+    page.getByTestId("verdict-badge");`,
    },
  },
  {
    id: "run-2",
    name: "Playwright: Run #2",
    system: "playwright",
    x: 8.2,
    lane: 1,
    deps: ["agent-debug"],
    detail: [
      { label: "Endpoint", value: "POST :3939/v1/run-test" },
      { label: "Attempt", value: "retryCount: 1" },
      { label: "Spec", value: "tests/e2e/quarantine-upload.spec.ts (patched)" },
    ],
    input: `{ "specFile": "tests/e2e/quarantine-upload.spec.ts",
  "retryCount": 1 }`,
  },
  {
    id: "analyze",
    name: "Agent: Analyze Results",
    system: "claude",
    x: 9.3,
    lane: 1,
    deps: ["run-2"],
    detail: [
      { label: "Endpoint", value: "POST :3939/v1/invoke (timeout 360s)" },
      { label: "Agent", value: "analyze-test-results" },
      { label: "Classifies", value: "AUTOMATION defect vs PRODUCT bug vs AMBIGUOUS" },
      { label: "Halts pipeline", value: "only on PRODUCT bug (human takes over)" },
    ],
    output: `{ "classification": "AUTOMATION",
  "rootCause": "selector drift — UI testid rename",
  "productImpact": "none — feature behaves per AC",
  "verdict": "safe to ship after retry PASS" }`,
  },
  // ---- delivery (back on main lane) ----
  {
    id: "jira-comment",
    name: "Jira: Post Result",
    system: "jira",
    x: 10.4,
    lane: 0,
    deps: ["gate-pass", "analyze"],
    detail: [
      { label: "Action", value: "add comment to QA-1427" },
      { label: "Includes", value: "pass/fail table · attempts · duration · artifacts" },
    ],
    output: `✅ Automated test generated & executed
• spec: tests/e2e/quarantine-upload.spec.ts
• result: PASSED · artifacts attached
• next: opening pull request`,
  },
  {
    id: "git-pr",
    name: "Agent: Git & PR",
    system: "github",
    x: 11.5,
    lane: 0,
    deps: ["jira-comment"],
    detail: [
      { label: "Endpoint", value: "POST :3939/v1/invoke" },
      { label: "Agent", value: "git-and-pr.md" },
      { label: "Branch", value: "ai/QA-1427-quarantine-e2e" },
      { label: "Files changed", value: "2 (+182 −0)" },
      { label: "Gate", value: "runs only when run_status = PASSED" },
    ],
    artifact: {
      title: "Pull request · #482",
      body: `qa-platform/e2e-suite · PR #482
ai/QA-1427-quarantine-e2e → main

## QA-1427 · quarantine flow for pw-protected archives
Generated by the AI pipeline; 1 self-correction
applied (selector drift). Human review required
before merge — the pipeline never merges.

Files:
+ tests/e2e/quarantine-upload.spec.ts
~ tests/pom/upload-page.ts`,
    },
  },
  {
    id: "jira-update",
    name: "Jira: Update Status",
    system: "jira",
    x: 12.6,
    lane: 0,
    deps: ["git-pr"],
    detail: [
      { label: "Transition", value: '"AI Analyzing" → "In Review"' },
      { label: "Comment", value: "PR link + notification to reporter" },
      { label: "Handback", value: "engineers own the merge" },
    ],
    output: `status: In Review
comment: "PR ready → github.com/qa-platform/
e2e-suite/pull/482 — please review."`,
  },
];

/* ------------------------------ Scenarios -------------------------------- */

const L = (at: number, text: string, level?: StageLog["level"]): StageLog => ({ at, text, level });

const COMMON_HEAD: readonly StageRun[] = [
  {
    stage: "trigger",
    duration: 1300,
    outcome: "passed",
    logs: [
      L(0.1, "webhook received · POST /webhook/generate-test-script"),
      L(0.55, 'payload: { ticketId: "QA-1427", to: "AI Analyzing" }'),
      L(0.9, "routing → Jira: Get Ticket", "ok"),
    ],
  },
  {
    stage: "fetch",
    duration: 2100,
    outcome: "passed",
    logs: [
      L(0.15, 'JQL: key = QA-1427 AND status = "AI Analyzing"'),
      L(0.6, "ticket loaded · 4 acceptance criteria · reporter: QA Lead"),
      L(0.92, "requirement parsed", "ok"),
    ],
  },
  {
    stage: "gate-meta",
    duration: 900,
    outcome: "passed",
    logs: [
      L(0.3, "pipeline metadata → generate_status: untouched"),
      L(0.85, "gate OPEN · proceeding", "ok"),
    ],
  },
  {
    stage: "handoff",
    duration: 1600,
    outcome: "passed",
    logs: [
      L(0.25, "writing .claude/AI-debug/handoff/QA-1427.md"),
      L(0.7, "normalized requirement + 3 approved test cases embedded"),
      L(0.95, "handoff persisted", "ok"),
    ],
  },
  {
    stage: "agent-gen",
    duration: 9200,
    outcome: "passed",
    logs: [
      L(0.05, "POST :3939/v1/invoke · agent: generate-test-script"),
      L(0.16, "loading agent definition + repo skills…"),
      L(0.3, "reading POM inventory · 34 page objects indexed"),
      L(0.48, "claude-sonnet-4-5 · streaming generation…"),
      L(0.72, "spec drafted · tests/e2e/quarantine-upload.spec.ts"),
      L(0.86, "static validation: tsc --noEmit ✓ · eslint ✓"),
      L(0.97, "tokens in 21,438 · out 2,847 · $0.19", "ok"),
    ],
  },
];

const DELIVERY = (prefix: string): readonly StageRun[] => [
  {
    stage: "jira-comment",
    duration: 1500,
    outcome: "passed",
    logs: [
      L(0.3, `posting result comment to QA-1427 (${prefix})`),
      L(0.85, "comment posted · artifacts linked", "ok"),
    ],
  },
  {
    stage: "git-pr",
    duration: 6200,
    outcome: "passed",
    logs: [
      L(0.08, "POST :3939/v1/invoke · agent: git-and-pr"),
      L(0.28, "git checkout -b ai/QA-1427-quarantine-e2e"),
      L(0.5, "commit: test(QA-1427): quarantine flow for pw-protected archives"),
      L(0.68, "push origin · opening pull request…"),
      L(0.9, "[Git & PR] attempts: 1 | pr: github.com/qa-platform/e2e-suite/pull/482", "ok"),
    ],
  },
  {
    stage: "jira-update",
    duration: 1800,
    outcome: "passed",
    logs: [
      L(0.3, 'transition QA-1427 → "In Review"'),
      L(0.7, "PR link + reporter notification posted"),
      L(0.95, "pipeline finished — engineers own the merge", "ok"),
    ],
  },
];

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "pass",
    label: "happy path",
    runs: [
      ...COMMON_HEAD,
      {
        stage: "run-1",
        duration: 8200,
        outcome: "passed",
        logs: [
          L(0.05, "[Playwright] metadata -> inprogress | ticket: QA-1427"),
          L(0.2, "npx playwright test quarantine-upload.spec.ts"),
          L(0.45, "browser: chromium · workers: 1 · fixtures: scan"),
          L(0.7, "1 passed (6.4s) · 0 failed · 0 skipped"),
          L(0.92, "[Playwright] passed=true exit=0 | metadata -> passed", "ok"),
        ],
      },
      {
        stage: "gate-pass",
        duration: 700,
        outcome: "passed",
        logs: [L(0.5, "TEST PASS → delivery branch", "ok")],
      },
      ...DELIVERY("attempt 1, no retries"),
    ],
  },
  {
    id: "fail",
    label: "self-correction path",
    runs: [
      ...COMMON_HEAD,
      {
        stage: "run-1",
        duration: 7400,
        outcome: "failed",
        logs: [
          L(0.05, "[Playwright] metadata -> inprogress | ticket: QA-1427"),
          L(0.2, "npx playwright test quarantine-upload.spec.ts"),
          L(0.55, "expect(verdictBadge).toHaveText — locator resolved 0 elements", "warn"),
          L(0.75, "1 failed (11.2s) · trace.zip captured", "error"),
          L(0.93, "[Playwright] passed=false exit=1 | metadata -> failed", "error"),
        ],
      },
      {
        stage: "gate-pass",
        duration: 700,
        outcome: "failed",
        logs: [L(0.5, "TEST FAIL → self-correction loop (attempt 1/3)", "warn")],
      },
      {
        stage: "agent-debug",
        duration: 8400,
        outcome: "passed",
        logs: [
          L(0.06, "POST :3939/v1/invoke · agent: run-and-debug-test"),
          L(0.2, "reading trace.zip + failure context…"),
          L(0.42, "hypothesis: selector drift (.verdict-chip removed in 4.2.1)"),
          L(0.6, "classification: AUTOMATION defect — safe to self-fix"),
          L(0.8, "patch applied → pom/upload-page.ts (getByTestId)"),
          L(0.95, "[AI Debug] attempts: 1 | metadata -> completed", "ok"),
        ],
      },
      {
        stage: "run-2",
        duration: 7000,
        outcome: "passed",
        logs: [
          L(0.05, "[Run #2] retryCount: 1 · re-executing patched spec"),
          L(0.5, "1 passed (6.1s) · 0 failed"),
          L(0.9, "[Playwright] passed=true exit=0 | metadata -> passed", "ok"),
        ],
      },
      {
        stage: "analyze",
        duration: 5200,
        outcome: "passed",
        logs: [
          L(0.1, "POST :3939/v1/invoke · agent: analyze-test-results"),
          L(0.45, "diffing attempt 1 vs attempt 2 · reading product logs"),
          L(0.7, "classification: AUTOMATION (selector drift) · product OK"),
          L(0.92, "[Analyze] QA-1427 | passed: true | verdict: ship", "ok"),
        ],
      },
      ...DELIVERY("attempt 2 after 1 self-correction"),
    ],
  },
];

/* ------------------------------- Meta ------------------------------------ */

export const PIPELINE_META = {
  workflow: "generate-test-script.wf",
  services: [
    { name: "n8n", detail: "orchestrator · :5678" },
    { name: "qa-ai-service", detail: "agent host · :3939" },
    { name: "claude-sonnet-4-5", detail: "via /v1/invoke" },
    { name: "playwright", detail: "via /v1/run-test" },
    { name: "jira · github", detail: "REST" },
  ],
  execBase: 38412,
  honesty:
    "Every node, agent name, endpoint, timeout, state, and log format mirrors the production n8n workflow and qa-ai-service. Identifiers are sanitized; durations are compressed (real runs take minutes, capped at 900s per agent call and 31m per test run).",
} as const;

export const PHASE_ONE_NOTE = {
  title: "Phase I happened before this",
  body: "A separate scheduled workflow (Test Case Writer) already researched the ticket, drafted the test plan with a ticket-writer agent, and waited for a human to mark the review file Approved before a jira-publisher agent pushed the test cases. This pipeline — Phase II — picks up only approved tickets.",
} as const;
