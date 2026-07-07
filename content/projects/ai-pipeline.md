---
title: AI Test Automation Pipeline — Production Architecture
summary: Deep technical documentation of Son's production AI pipeline — two n8n workflows, a local agent-host service, six Claude agents, human approval gates, self-correction, and PR delivery. The live demo is at /work/ai-pipeline.
keywords: [pipeline, n8n, workflow, orchestration, qa-ai-service, agent, Claude, claude-sonnet-4-5, handoff, self-correction, retry, failure classification, Playwright, generate test script, test case writer, jira publisher, git and pr, run and debug, analyze test results, webhook, JQL, human in the loop, approval, demo, pipeline console, quy trình, tự động hoá]
tags: [project, ai, pipeline, architecture, flagship]
category: project
project: ai-pipeline
lastUpdated: 2026-07-07
---

# The AI Test Automation Pipeline — how it actually works

This is the production implementation behind Son's flagship "Jira ticket → pull request" platform. An interactive replay of it — real node names, states, endpoints, and log formats — runs at **/work/ai-pipeline** (the Pipeline Console demo). Identifiers below are sanitized; the architecture is exact.

## Two-phase architecture

The platform is **two separate n8n workflows** with a human approval gate between them:

**Phase I — Test Case Writer.** A scheduled/webhook-triggered workflow polls Jira for tickets moved to the "AI Analyzing" status, loops over them, filters by project, checks pipeline metadata (so a ticket is never processed twice), and calls a **ticket-writer agent** that researches the ticket (Jira + Confluence + codebase), drafts a structured test plan, and writes it to a review file. The pipeline then **waits for a human**: only when a QA lead marks the review file `Status: Approved` does a **jira-publisher agent** push the finalized test cases to the Jira ticket and comment. Machine proposes, human approves — by design.

**Phase II — Generate Test Script.** Picks up approved tickets. Steps: verify status and untouched metadata → **write a handoff file** (`.claude/AI-debug/handoff/<TICKET>.md` — a durable contract carrying the normalized requirement, approved test cases, agent mode, and reporter) → **generate-test-script agent** writes the Playwright spec → the spec is **executed immediately** → a gate branches on the result:
- **PASS** → post result comment to Jira → **git-and-pr agent** creates branch, commit, and pull request → Jira transitions to "In Review" with the PR link.
- **FAIL** → **run-and-debug-test agent** self-corrects (it may only fix AUTOMATION bugs, max 3 attempts) → re-run → **analyze-test-results agent** classifies the failure → if resolved, continue to delivery; if it's a PRODUCT bug, the pipeline halts and hands to a human.

## The agent host: qa-ai-service

Agents don't run inside n8n. n8n code-nodes call a small local Node.js service (**qa-ai-service**, port 3939) that hosts everything AI:

- `POST /v1/invoke` — runs a named agent (`generate-test-script`, `run-and-debug-test`, `git-and-pr`, `analyze-test-results`, ticket-writer, jira-publisher). Agent definitions are markdown files (`agents/<name>.md`) with skills and assets resolved into the prompt.
- `POST /v1/run-test` — executes a Playwright spec, returns pass/fail + duration + artifacts.
- Three AI modes: `copilot`, `claude-api` (direct Anthropic API, default model **claude-sonnet-4-5**), and `claude-cli` (Claude Code CLI — enables repo-aware runs where the agent can read the actual codebase).
- Real timeouts: agent invocations 900s; test execution up to 31 minutes; analyze 360s.
- Per-run metadata is posted back (states: `inprogress → passed | failed | error | completed`), including retryCount and PR URL extraction.

## Why these engineering decisions

- **n8n for orchestration, not code:** the workflow is visible, auditable, and editable by non-authors; every run has an execution ID and per-node I/O history. Orchestration logic and AI logic are cleanly separated.
- **Handoff files as contracts:** phases communicate through durable markdown files, not in-memory state — any phase can be re-run independently, and humans can read/edit the contract. This is the same "explicit contract at the boundary" principle as Beacon's IPC layer.
- **A local agent host instead of calling Claude from n8n:** one place owns prompt assembly, agent definitions, model selection, timeouts, and logging; n8n nodes stay thin HTTP callers.
- **Failure classification before retry:** the debug agent is only allowed to fix AUTOMATION defects (selector drift, timing). If analysis says PRODUCT bug, the pipeline stops — an AI that "fixes" tests to pass over real bugs would be worse than useless.
- **Human gates at both ends:** a person approves the test plan before code is generated, and a person reviews the PR before merge. The AI owns the repetitive middle, never the judgment.

## The live demo (/work/ai-pipeline)

The Pipeline Console replays this exact workflow as an orchestration UI: snake-layout phase rows (Intake → Generate & Execute → Self-Correction → Delivery), live statuses, streaming logs in the real log format, a per-node inspector (endpoint, model, tokens, cost, I/O payloads, artifacts — including the generated Playwright spec, the self-correction diff, and the PR summary), pause/resume/restart and speed controls. It alternates a happy-path run with a self-correction run. Durations are compressed; everything else mirrors production.

## Measured results

~20 minutes from ticket to PR for a typical task (~10 test cases) in POC runs; the pipeline runs end-to-end with no manual step between requirement analysis and the pull request.

## Tóm tắt tiếng Việt

Pipeline AI của Sơn gồm **2 workflow n8n**: Phase I (Test Case Writer) nghiên cứu ticket Jira, soạn test plan, **chờ người duyệt** rồi mới đăng lên Jira; Phase II (Generate Test Script) viết handoff file, agent sinh Playwright spec, chạy ngay, nếu fail thì agent tự sửa (chỉ được sửa lỗi AUTOMATION, tối đa 3 lần), agent phân loại lỗi (AUTOMATION/PRODUCT), pass thì tự tạo branch + commit + Pull Request và chuyển ticket sang "In Review". Các agent chạy qua service nội bộ **qa-ai-service** (cổng 3939, model claude-sonnet-4-5, hỗ trợ Claude Code CLI để agent đọc được codebase). Demo tương tác tại **/work/ai-pipeline** tái hiện đúng workflow production (tên agent, endpoint, log format thật — chỉ nén thời gian). Kết quả đo được: ~20 phút từ ticket ra PR.
