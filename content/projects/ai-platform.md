---
title: AI-Powered Test Automation Platform
summary: A multi-agent system that automates the journey from a Jira ticket to a production-ready automation pull request — Son Bui's flagship project.
keywords: [AI platform, AI automation, multi-agent, Claude Agent SDK, MCP, n8n, Jira, pull request, testing workflow, AI-powered testing, orchestration]
tags: [project, ai, flagship, architecture, automation]
category: project
project: ai-platform
lastUpdated: 2026-07-05
---

## Overview

The AI-Powered Test Automation Platform is Son's flagship project (a proof of concept, actively expanding). It is a multi-agent system that automates the journey from a Jira ticket to a production-ready automation pull request — requirement analysis, test generation, execution, failure triage, and delivery, orchestrated end to end.

## The problem

Test automation is usually treated as a manual engineering workflow: read the ticket, understand requirements, write the test, run it, debug the failure, open the PR. Every step is repetitive, and every engineer does it slightly differently — so effort scales linearly with the work.

## The insight

Treat AI not as a coding assistant but as an engineering component: specialized agents that each own a stage of the lifecycle and collaborate through a shared orchestration layer, with context supplied by the Model Context Protocol (MCP). The goal isn't more tests; it's removing the repetitive engineering between a requirement and its verification.

## Agent orchestration architecture

Context enters through **Jira MCP** and **Confluence MCP** connectors into an **Orchestrator** built on the Claude Agent SDK, n8n, and YAML workflows. The orchestrator coordinates six specialized agents and emits artifacts: Playwright tests, a Git branch and pull request, and a Jira comment. A self-correction loop feeds fixes from the Failure Analyst back to the Test Generator.

The six agents:

- **Requirement Analyst** — normalizes the ticket into testable requirements.
- **Knowledge Retriever** — pulls project context from Jira & Confluence.
- **Test Generator** — writes Playwright (TypeScript) automation.
- **Executor** — runs the suite and captures results.
- **Failure Analyst** — separates automation issues from real defects.
- **PR Author** — creates the branch, commits, PR, and Jira comment.

## Execution sequence (Ticket → PR)

1. **Ticket received** (Jira MCP) — requirements normalized into a testable spec.
2. **Context retrieved** — relevant project knowledge pulled from Jira & Confluence to ground generation.
3. **Tests generated** — Playwright TypeScript tests authored from requirements and context.
4. **Suite executed** — automation runs; results, traces, and failures collected.
5. **Failures triaged** — each failure classified as automation issue vs. genuine product defect.
6. **Self-correction loop** — flaky or fixable automation is corrected and re-run automatically.
7. **Delivered** — branch, commits, and PR created and the Jira ticket updated, ready for human review.

## Engineering decisions & trade-offs

- **AI as an engineering component, not an assistant.** Each agent owns one lifecycle stage with a clear contract, so the system is composable and debuggable — not a single opaque prompt.
- **MCP for context, not scraping.** MCP gives agents structured access to Jira & Confluence, keeping context accurate and integration maintainable.
- **Human-in-the-loop at the PR.** The platform stops at a pull request; delivery stays reviewable. AI does the repetitive work, engineers own the merge.
- **Orchestration via n8n + YAML.** Declarative workflows make the pipeline transparent and easy to extend without rewriting agent logic.

## Results (POC)

- ~20 minutes from ticket to PR for a typical task (~10 test cases).
- 6 specialized agents across the lifecycle.
- End-to-end with no manual step in between.

## What's next

Broaden coverage beyond Playwright to desktop/API generation; add confidence scoring so the platform knows when to defer to a human; and richer failure analytics feeding suite-health trends.

## Stack

Claude Agent SDK, Model Context Protocol, Jira MCP, Confluence MCP, Playwright, TypeScript, n8n, YAML, Git automation.
