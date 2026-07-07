---
title: Beacon — AI Operating System for Software Engineers
summary: A cross-platform Electron desktop platform unifying multi-repo GitHub reviews, Jira sprints, and an adaptive AI planner — Son Bui's featured engineering case study, built solo.
keywords: [Beacon, Electron, desktop app, AI review, Claude CLI, adaptive planner, Jira sprint, GitHub PR, MongoDB, offline-first, IPC, vanilla JavaScript, case study]
tags: [project, ai, desktop, architecture, platform, case-study]
category: project
project: beacon
lastUpdated: 2026-07-06
---

# Beacon — An AI Operating System for Software Engineers

Full case study: /work/beacon (interactive architecture explorer, live demo, engineering timeline, metrics, downloads)

## What it is

Beacon is a cross-platform Electron desktop application (macOS DMG & Windows NSIS installers) that unifies an engineer's day into one system: multi-repo GitHub review tracking with automatic AI code review, multi-project Jira sprint management, and an adaptive day planner that learns the user's real velocity. Claude is integrated as a governed engineering component — every AI run shows exact token cost, nothing posts without permission, and all AI features degrade gracefully when the Claude CLI isn't installed.

Son built Beacon solo — product, architecture, and delivery. It is an internal tool in daily use, with 278+ versioned internal builds shipped.

## Key features

- **AI Daily Brief**: the landing dashboard — a deterministic base (exact numbers, computed instantly, never blocks on AI) enriched by a Claude narrative; cache-first, pre-generated in both UI languages (English/Vietnamese).
- **Auto AI review**: new PRs requesting the user's review are queued and reviewed by Claude one run at a time, with the team's Knowledge Hub as context; findings are saved with history and re-reviewed on new commits (60s settle window).
- **Adaptive Planner**: a pure-algorithm solver places work around meetings and lunch. Block state ladder: Reserved → Accepted → Placed → Locked; changes to accepted blocks go through a diff the user approves. The engine measures real beliefs (minutes per story point, review time, golden hours). AI Plan classifies tickets by role (Dev full effort, QA ~50%) and splits big tickets across days.
- **Sprint (Jira)**: multi-project sprint health, forecast (points remaining × measured velocity vs hours left), AI-drafted standups from real activity, retro boards.
- **Knowledge Hub**: per-repo team knowledge stored centrally; compiles to local-only Claude skills; "Learn from reviews" mines ~100 recent team review comments into proposed rules.
- Everything is wired together: a PR merging auto-completes its plan block; a Jira ticket hitting Done closes its schedule entry; notes become reminders and plan items.

## Architecture

Electron's three-process model used as a security architecture:

- **Renderer**: 12 product modules in dependency-free vanilla JavaScript (~13.9K lines) — no framework, no build step.
- **Preload bridge**: contextIsolation: true, nodeIntegration: false; exactly 60 whitelisted invoke-style IPC channels (verb:object naming) — the whole UI capability surface in one auditable file.
- **Main process**: 13 feature stores (~1.4K lines) owning every privileged operation — Claude CLI engine, safe-by-construction git layer (fixed argv, strict branch regex, patches via stdin, force-push doesn't exist), Jira client, differential sync stores, OS-keychain secrets.
- **Data**: MongoDB as source of truth (5 collections), offline-first with disk cache, newer-side-wins conflict resolution, differential sync (bulk upserts keyed by owner+id — never delete-all/insert-all).
- Only 2 runtime dependencies: dotenv and mongodb.

## Engineering judgement highlights

- Chose Claude CLI over the API: reuses the engineer's own login (zero key management) and can read the actual codebase during review when run with the repo as cwd.
- Documented honest threat model in the README: the shipped MongoDB credential is AES-256-GCM encrypted but explicitly called obfuscation; three ranked remediation options with effort estimates; backend API + JWT is the top roadmap item.
- Known, named gap: no automated test suite (only a node --check syntax gate). Son discusses this openly — the sync-wipe bug that real usage found is exactly what a store-layer test would have caught, and the plan is to use his AI test-automation platform to generate Beacon's regression suite.
- Vanilla JS renderer was a deliberate zero-build-step bet that kept iteration fast to ~10K lines; past that Son says ES modules and a typed IPC contract would be the refactor.

## How it connects to Son's other work

Beacon applies the same philosophy as his AI-Powered Test Automation Platform — AI as a governed engineering component, not an assistant — but as a product with users, accounts, onboarding, i18n, themes, and installers rather than a pipeline. The story across projects: tests → framework that writes tests → infrastructure that runs them → platform where AI generates them → Beacon, the thesis applied to an engineer's entire day. Platforms and systems, not just applications.

## Six engineering highlights (the code worth reading)

1. **A git layer that can't be abused** (`git-store.js`) — fixed argument vectors, no shell, branch names regex-validated, patches via stdin; force-push has no code path. Safe by construction, not by validation.
2. **Claude CLI as a cross-platform engine** (`claude-cli.js`) — binary resolution across PATH + install dirs; Windows .cmd shims run through a shell but user content only ever travels via stdin; token usage rides a side-channel so callers keep plain-text responses; timeouts scale with context (300s with repo access, 120s without).
3. **Sync that can't wipe your other machine** (`reminders-store.js`) — differential sync (bulk upserts keyed by owner+id, targeted deletes only) after a real two-machine data-loss bug; claim-once legacy migrations with atomic renames.
4. **A 60-channel security boundary you can read in one sitting** (`preload.js`) — contextIsolation on, nodeIntegration off, every UI capability explicitly enumerated; embedded GitHub/Jira webviews in isolated session partitions.
5. **Offline-first without a sync framework** (`mongo.js`) — lazy singleton client, retry-after backoff, MONGO_OFFLINE fast-fail, disk-first atomic writes, newer-side-wins on reconnect. CRDTs would have been résumé-driven development.
6. **Secrets engineering with an honest threat model** (`env-crypt.js` + README) — OS-keychain tokens, scrypt passwords, AES-256-GCM for the shipped Mongo URI — documented as obfuscation, with three ranked remediation options and effort estimates.

## Engineering journey (phases)

Problem discovery (tab-archaeology mornings) → architecture design (Electron three-process as a security architecture; vanilla JS renderer as a zero-build-step bet) → MVP (a PR tracker — package.json still says `pr-tracker`) → AI integration (review pipeline, Daily Brief, AI Plan — CLI over API for zero key management + repo-aware review) → multi-account & sync hardening (the bugs only real usage finds) → productization (onboarding, EN/VI i18n, admin accounts, encrypted packaging, 278+ builds) → honest ledger (two named debts: client-held DB credential and no automated tests) → roadmap (backend API + JWT first; then a test suite generated by his own AI platform — there's poetry in that).

## What Son would change today

TypeScript at the IPC boundary from day one (the 60-channel contract is disciplined but stringly-typed), and ES modules once the renderer passed ~10K lines — the zero-build-step bet paid off early and started costing later.

## Where to experience it

The case study at **/work/beacon** includes an interactive architecture explorer (14 clickable components), a live in-page demo recreating 8 modules of the real app with its actual design tokens (light/dark), an engineering metrics dashboard computed from the repo, and real macOS/Windows installers via GitHub Releases.

## Tóm tắt tiếng Việt

**Beacon** là desktop app đa nền tảng (Electron, macOS & Windows) do Sơn tự thiết kế và xây một mình — "hệ điều hành AI cho kỹ sư phần mềm": theo dõi PR đa repo với AI tự review code (Claude), quản lý sprint Jira đa dự án, lịch trình thích ứng học tốc độ làm việc thật của người dùng, Knowledge Hub biến tri thức team thành agent. Kiến trúc: renderer 12 module viết JavaScript thuần (~13.9K dòng, không framework), preload bridge 60 kênh IPC được liệt kê tường minh (contextIsolation), main process 13 feature store, MongoDB offline-first với differential sync, chỉ 2 runtime dependency. Đã ship 278+ bản build nội bộ, dùng hằng ngày. Điểm đặc biệt: Sơn công khai cả điểm yếu (chưa có test suite tự động, credential DB nằm ở client kèm threat model và lộ trình sửa) — kỹ sư trưởng thành là biết gọi tên nợ kỹ thuật. Case study tương tác tại **/work/beacon**, có demo 8 module và link tải bản cài thật.
