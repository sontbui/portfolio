/* ==========================================================================
   BEACON — ENGINEERING CASE STUDY CONTENT
   Every metric below is computed from the actual repository (LOC via wc,
   IPC handlers via grep, modules via ls). Claims reference real files.
   Presentation lives in src/sections/beacon/*; this is the copy layer.
   ========================================================================== */

export const BEACON = {
  eyebrow: "Engineering Case Study · Desktop Platform",
  title: "Beacon",
  tagline: "An AI operating system for software engineers",
  summary:
    "A cross-platform Electron desktop app that unifies multi-repo GitHub reviews, multi-project Jira sprints, and an adaptive day planner into one system — with Claude wired in as an engineering component: automatic PR review, an AI daily brief, and a planner that learns your real pace.",
  status: "Internal tool · in daily use · macOS & Windows",
  version: "v278.x — the version counter is a continuous internal-release count",
} as const;

/* ------------------------------- Problem --------------------------------- */

export const BEACON_PROBLEM = {
  problem: {
    label: "The Problem",
    body: "An engineer's day is fragmented across tools that don't talk to each other: PRs waiting in three repos, a sprint board in Jira, a calendar full of meetings, and a plan that lives in your head. Each context switch loses state, and no tool knows what the others know — so prioritization happens by anxiety, not by data.",
  },
  insight: {
    label: "The Insight",
    body: "The fix isn't another dashboard — it's a system where the pieces are wired together: a PR merging auto-completes its plan block, a Jira ticket moving to Done closes its schedule entry, a note becomes reminders and plan items. And AI belongs inside that loop as a disciplined component — every run shows its token cost, nothing posts without permission — not as a chat window bolted on the side.",
  },
  context: {
    label: "Business Context",
    body: "Built as an internal productivity platform for engineers who both write and review code across multiple repositories and Jira projects. The economics are simple: review latency and planning overhead are the two biggest hidden taxes on a senior engineer's week. Beacon attacks both — AI pre-reviews every PR that requests you, and the planner turns sprint data into an executable schedule.",
  },
} as const;

/* --------------------------- Metrics (computed) --------------------------- */

export interface BeaconMetric {
  readonly value: string;
  readonly label: string;
  readonly note?: string;
}

export const BEACON_METRICS: readonly BeaconMetric[] = [
  { value: "15.3K", label: "Lines of JavaScript", note: "13,890 renderer · 1,415 main process (wc -l)" },
  { value: "60", label: "IPC channels", note: "ipcMain.handle registrations, each whitelisted in preload.js" },
  { value: "13", label: "Main-process feature modules", note: "ai · auth · git · jira · sync · secrets …" },
  { value: "12", label: "User-facing modules", note: "Dashboard → Plan → Sprint → Knowledge Hub" },
  { value: "2", label: "Runtime dependencies", note: "dotenv + mongodb — the entire UI is dependency-free vanilla JS" },
  { value: "84", label: "Design tokens", note: "One semantic layer, mapped to light & dark themes" },
  { value: "2", label: "Languages", note: "Full EN / Vietnamese i18n, AI answers follow the UI language" },
  { value: "278+", label: "Internal builds shipped", note: "Version counter across macOS DMG & Windows NSIS releases" },
];

export const BEACON_METRICS_HONESTY =
  "Numbers are computed from the repository (wc, grep, ls — not estimated). One number that matters is missing on purpose: automated test coverage is currently zero. That gap, and what it taught me, is covered honestly in Lessons Learned below.";

/* --------------------------- Architecture nodes --------------------------- */

export type BeaconLayer = "renderer" | "bridge" | "main" | "external";

export interface ArchNode {
  readonly id: string;
  readonly name: string;
  readonly layer: BeaconLayer;
  readonly tech: string;
  readonly responsibility: string;
  readonly why: string;
  readonly dependsOn: readonly string[];
  readonly detail: string;
}

export const ARCH_LAYERS: Record<BeaconLayer, { title: string; caption: string }> = {
  renderer: { title: "Renderer — the product", caption: "12 modules · vanilla JS · zero framework" },
  bridge: { title: "Preload bridge — the contract", caption: "contextBridge · 60 whitelisted channels" },
  main: { title: "Main process — the platform", caption: "13 feature stores · privileged operations" },
  external: { title: "External systems", caption: "Everything the client talks to" },
};

export const ARCH_NODES: readonly ArchNode[] = [
  {
    id: "dashboard",
    name: "AI Daily Brief",
    layer: "renderer",
    tech: "Vanilla JS · scoped CSS-in-JS",
    responsibility: "The landing page: a deterministic morning brief (exact numbers) enriched by a Claude narrative — today's read, goal, risks, focus score.",
    why: "The base is computed instantly so startup never blocks on AI; Claude only adds the narrative layer. Cached per workspace per day, pre-generated in the background for the other UI language.",
    dependsOn: ["bridge-api", "ai"],
    detail: "src/renderer/features/dashboard/ — brief.js computes the deterministic base, brief-ai.js enriches it, brief-cache.js makes it cache-first. The design's tokens are injected scoped under a `.db` wrapper so the brief's animations never leak into the rest of the app.",
  },
  {
    id: "github",
    name: "GitHub & PR Review",
    layer: "renderer",
    tech: "Vanilla JS · REST polling",
    responsibility: "Multi-repo PR tracking: Requested / Assigned / All tabs, SLA nudges, auto AI-review queue, and a PR focus mode with diff, conversation, and an embedded GitHub webview.",
    why: "The repo being viewed is fetched deeply; other active repos watch page 1 only — full visibility without hammering the API.",
    dependsOn: ["bridge-api", "ai", "git"],
    detail: "src/renderer/features/github/ + pr-detail/ — auto-review.js queues new PRs requesting your review, runs Claude one at a time, saves findings to MongoDB, and re-reviews on new commits with a 60s settle window for batched pushes.",
  },
  {
    id: "plan",
    name: "Adaptive Planner",
    layer: "renderer",
    tech: "Vanilla JS · constraint solver",
    responsibility: "Turns tickets, reviews, and reminders into an executable day: a pure-algorithm solver places work around meetings and lunch, and a block state ladder (Reserved → Accepted → Placed → Locked) keeps the human in charge.",
    why: "\"The machine proposes — you decide.\" Any change to an accepted block goes through a diff you approve. The engine measures your real velocity (minutes per story point, review time, golden hours) before it trusts its own estimates.",
    dependsOn: ["bridge-api", "ai"],
    detail: "src/renderer/features/plan/ — engine.js is the solver, schedule.js the timeline, ai-plan.js the Claude overlay that classifies tickets by role (Dev = full effort, QA ≈ 50%, scheduled after dev) and auto-splits big tickets across days respecting capacity.",
  },
  {
    id: "sprint",
    name: "Sprint (Jira)",
    layer: "renderer",
    tech: "Vanilla JS · JQL",
    responsibility: "Multi-project sprint health, My Work lanes, forecast (points remaining × measured velocity vs. hours left), and ceremonies: AI-drafted standups, retro boards, review summaries.",
    why: "Custom field mapping per project with auto-detect (reads 20 real tickets to guess the point/QA fields) — because no two Jira instances are configured the same.",
    dependsOn: ["bridge-api", "ai"],
    detail: "src/renderer/features/sprint/ — sprint.js, ticket-detail.js, ceremonies.js. QA share is a first-class concept: a ticket where you're only the QA counts 50% of its points, and that flows into both the forecast and the planner.",
  },
  {
    id: "knowledge",
    name: "Knowledge Hub",
    layer: "renderer",
    tech: "Vanilla JS · agent packaging",
    responsibility: "Per-repo team knowledge (docs, rules, agents) stored centrally so a second machine needs no re-import; compiles down to local-only Claude skills that are never committed.",
    why: "AI review quality is a context problem. \"Learn from reviews\" reads ~100 recent team review comments and proposes recurring rules you approve — the system gets better from the team's own history.",
    dependsOn: ["bridge-api", "ai"],
    detail: "src/renderer/features/knowledge/ — agent import is packaging: the AI follows every skill/sub-agent/command an agent references, reads it verbatim, and stores a package so every run ships with its full context.",
  },
  {
    id: "bridge-api",
    name: "window.api",
    layer: "bridge",
    tech: "contextBridge · preload.js",
    responsibility: "The single, explicit contract between UI and platform: 60 invoke-style channels, JSON in / JSON out. The renderer has no Node access at all.",
    why: "contextIsolation: true and nodeIntegration: false mean a compromised renderer (or embedded webview) cannot touch the filesystem, spawn processes, or read secrets. Every capability the UI has is enumerated in one 100-line file.",
    dependsOn: [],
    detail: "src/preload.js — verb:object channel naming (git:checkout, ai:claude, reminders:sync). All request/response via ipcMain.handle; the one fire-and-forget channel is ai:usage, a side-channel for token costs.",
  },
  {
    id: "ai",
    name: "Claude CLI Engine",
    layer: "main",
    tech: "child_process · stdin piping",
    responsibility: "Runs every AI feature through the locally signed-in Claude Code CLI: resolves the real binary across platforms, pipes prompts via stdin, parses JSON output, reports token cost on a side-channel.",
    why: "CLI over API was a deliberate call: it reuses the engineer's existing Claude login (zero key management), and with a repo path as cwd, Claude can actually read the codebase during review — deep review for free.",
    dependsOn: ["ext-claude"],
    detail: "src/main/features/ai/claude-cli.js — Windows .cmd shims must run through a shell, so user content never touches the command line: prompts go through stdin, model flags are regex-validated. Timeouts scale with context: 300s with repo access, 120s without.",
  },
  {
    id: "git",
    name: "Git Layer",
    layer: "main",
    tech: "spawn · fixed argv",
    responsibility: "Safe-by-construction git: dedicated handlers with fixed argument vectors, strict branch-name validation, patches applied via stdin. Force-push simply doesn't exist here.",
    why: "The AI proposes diffs, so the layer that applies them must be impossible to abuse. No string interpolation into commands means no injection surface — destructive operations were designed out, not guarded against.",
    dependsOn: [],
    detail: "src/main/features/git/git-store.js — BRANCH_RE = /^[\\w][\\w./-]{0,200}$/, PATH augmented for GUI apps (Homebrew, Git-for-Windows) so git resolves like it would in a terminal. Apply tries -p1 → -p0 → 3-way before surfacing an error.",
  },
  {
    id: "sync",
    name: "Sync & Stores",
    layer: "main",
    tech: "MongoDB driver · atomic writes",
    responsibility: "Per-account persistence: reminders, workspace, config, events. Differential sync (bulk upsert + targeted deletes) and claim-once legacy migrations with atomic renames.",
    why: "Two machines editing concurrently must never wipe each other — delete-all/insert-all was replaced by ops keyed on (owner, id). Offline: the app runs from disk cache; on reconnect, the newer side wins.",
    dependsOn: ["ext-mongo"],
    detail: "src/main/features/reminders/reminders-store.js, userdata/, workspace/, config/ — plus db/mongo.js: a lazy singleton client with retry-after backoff and a MONGO_OFFLINE fast-fail so the UI can show a red banner instead of hanging.",
  },
  {
    id: "secrets",
    name: "Secrets & Auth",
    layer: "main",
    tech: "safeStorage · scrypt · AES-256-GCM",
    responsibility: "GitHub/Jira tokens encrypted via the OS keychain per account; passwords hashed with scrypt + timing-safe comparison; the shipped Mongo credential encrypted as .env.enc.",
    why: "The .env encryption is deliberately documented as obfuscation, not protection — the README ships a full threat model and three ranked fix options. Knowing exactly what your security does and doesn't do is the engineering.",
    dependsOn: ["ext-mongo"],
    detail: "src/main/features/token/token-store.js, auth/users-store.js, db/env-crypt.js — AES-256-GCM with random IV and auth tag. The honest limitation: the key is derived from an embedded passphrase, so the real fix (a backend API holding the credential) is the top roadmap item.",
  },
  {
    id: "ext-mongo",
    name: "MongoDB Atlas",
    layer: "external",
    tech: "Source of truth",
    responsibility: "users · reminders · ai_reviews · settings · user_data — everything an account owns, so a second machine picks up where the first left off.",
    why: "Chosen for schemaless iteration speed during rapid product evolution. The client-holds-credential trade-off is documented and scheduled to move behind a small API.",
    dependsOn: [],
    detail: "5 collections. Knowledge Hub doc content (≤60KB/file) also lives here so team knowledge follows the account, not the machine.",
  },
  {
    id: "ext-github",
    name: "GitHub API",
    layer: "external",
    tech: "REST · PAT",
    responsibility: "PR polling, review posting, search. Each repo can carry its own token and local path for deep review.",
    why: "Tokens validated for real via GET /user at onboarding; never sent to MongoDB — they stay keychain-encrypted on the machine.",
    dependsOn: [],
    detail: "Embedded GitHub views run in an isolated persist:github session partition, separate from the app and from Jira.",
  },
  {
    id: "ext-jira",
    name: "Jira Cloud",
    layer: "external",
    tech: "REST · JQL",
    responsibility: "Sprint and ticket data across multiple projects and boards, including custom-field discovery and an authenticated image proxy for private attachments.",
    why: "The proxy returns data: URLs so private Jira images render inside the app without leaking the session to the renderer.",
    dependsOn: [],
    detail: "src/main/features/jira/jira-client.js — Basic auth from keychain-stored token, 8MB attachment cap, per-account config with legacy fallback.",
  },
  {
    id: "ext-claude",
    name: "Claude Code CLI",
    layer: "external",
    tech: "Local binary · user's login",
    responsibility: "The AI engine. Model per run (Haiku / Sonnet / Opus with price factors), with the local repo as working directory for code-aware review.",
    why: "Every run reports exact tokens and cost in the UI. AI features degrade gracefully: no CLI on the machine simply disables the ✦ buttons.",
    dependsOn: [],
    detail: "Beacon never proxies AI through a server — inference runs under the engineer's own account, on their machine, with their permissions.",
  },
];

/* ------------------------------ Data flows -------------------------------- */

export interface FlowStep {
  readonly actor: string;
  readonly action: string;
}

export const REVIEW_FLOW: readonly FlowStep[] = [
  { actor: "Poller", action: "New PR requests your review — queued {repo, number}, one Claude run at a time" },
  { actor: "Renderer", action: "window.api.aiClaude({prompt, cwd, model}) — the repo's local path enables deep review" },
  { actor: "Preload", action: "Whitelisted channel ai:claude → ipcMain.handle in the main process" },
  { actor: "Claude CLI", action: "Reads the diff, full discussion, and the actual codebase; returns JSON findings" },
  { actor: "Main", action: "Token cost emitted on the ai:usage side-channel; findings saved to ai_reviews" },
  { actor: "Renderer", action: "Status reviewing → ready → posted; new commit on a ready PR triggers auto re-review" },
];

export const SYNC_FLOW: readonly FlowStep[] = [
  { actor: "Login", action: "Compare disk cache vs. MongoDB timestamps — newer side wins, per data kind" },
  { actor: "Session", action: "Writes hit disk immediately (atomic tmp+rename), push to Mongo debounced" },
  { actor: "Offline", action: "db:status poll fails → red banner + Retry; app keeps running from cache" },
  { actor: "Reconnect", action: "Differential sync: bulk upserts keyed (owner, id), targeted deletes only" },
];

export const DEPLOY_FLOW: readonly FlowStep[] = [
  { actor: "check", action: "node --check on every JS file — the build gate (scripts/check-syntax.js)" },
  { actor: "bump", action: "Version counter increments — 278+ internal releases and counting" },
  { actor: "encrypt", action: ".env → AES-256-GCM → .env.enc shipped via extraResources, decrypted in memory" },
  { actor: "electron-builder", action: "macOS DMG (hardened runtime) + Windows NSIS, ASAR-packed" },
];

/* ----------------------------- Timeline ----------------------------------- */

export interface TimelineStage {
  readonly phase: string;
  readonly title: string;
  readonly body: string;
  readonly decision: string;
  readonly wouldChange?: string;
}

export const BEACON_TIMELINE: readonly TimelineStage[] = [
  {
    phase: "01 · Problem discovery",
    title: "The tax nobody itemizes",
    body: "Reviewing across multiple repos while running QA on a sprint meant every morning started with twenty minutes of tab archaeology: which PRs are waiting on me, what moved in Jira, what did I promise to finish today? Existing tools each solved one slice and made the fragmentation worse.",
    decision: "Build one system where GitHub, Jira, and my own plan share state — a desktop app, because it needs local git, a local AI CLI, and OS keychain access that a web app can't have.",
  },
  {
    phase: "02 · Architecture design",
    title: "Boring where it matters, radical where it pays",
    body: "Electron with a strict three-layer split: a sandboxed renderer, an explicit preload contract, and a main process that owns every privileged operation. The renderer is deliberately vanilla JavaScript — no framework, no build step, instant reload.",
    decision: "Considered Tauri (lighter, but the Node ecosystem and MongoDB driver won), a web app (rejected — no local git or CLI), and React (rejected for iteration speed at solo scale — a trade-off I'd revisit, honestly, at 15K lines).",
    wouldChange: "I'd introduce TypeScript at the IPC boundary from day one. The 60-channel contract is disciplined but stringly-typed — the exact class of bug a 200-line .d.ts would eliminate.",
  },
  {
    phase: "03 · MVP",
    title: "A PR tracker (the package.json still confesses)",
    body: "The first working version did one thing: poll multiple repos and show which PRs were waiting on me, with SLA nudges. The internal package name is still `pr-tracker` — I kept it as an honest fossil of where the product started.",
    decision: "Ship the smallest thing that changed my own morning, then let daily use drive the roadmap. Every module that exists today was added because the previous one created demand for it.",
  },
  {
    phase: "04 · AI integration",
    title: "Claude as a component, not a feature",
    body: "AI review came first: new PRs requesting my review get pre-reviewed with the team's Knowledge Hub as context, findings saved with full history. Then the Daily Brief, then AI Plan. Each follows the same discipline: visible token cost, graceful degradation, nothing posted without permission.",
    decision: "Claude CLI over the API — it reuses the engineer's existing login (zero key distribution) and, run with the repo as cwd, it can actually read the code it's reviewing. Trade-off accepted: the machine needs Claude Code installed.",
    wouldChange: "The 60s re-review settle window was found empirically after rapid pushes triggered redundant runs. I'd design queue back-pressure up front next time.",
  },
  {
    phase: "05 · Multi-account & sync hardening",
    title: "The bugs only real usage finds",
    body: "Running on two machines surfaced the classic sync failure: full-replace sync let one stale machine wipe the other's reminders. The fix became a design principle — differential sync everywhere (bulk upserts keyed by owner+id, targeted deletes), claim-once legacy migrations, atomic tmp+rename writes.",
    decision: "Offline-first with newer-side-wins conflict resolution — last-write-wins is a real limitation vs. 3-way merge, but it's the honest 90% solution for a single-user-per-account tool.",
  },
  {
    phase: "06 · Productization",
    title: "From tool to product",
    body: "Onboarding (role → work schedule → validated GitHub PAT → optional Jira), full EN/Vietnamese i18n, light/dark themes over one semantic token layer, admin accounts with per-module grants, encrypted packaging, and 278+ versioned internal builds for macOS and Windows.",
    decision: "Treat the internal audience like customers: a 4-step onboarding and a documented Gatekeeper unblock path for unsigned macOS builds, because 'works on my machine' isn't a distribution strategy.",
  },
  {
    phase: "07 · Current state — with the gaps named",
    title: "Honest ledger",
    body: "In daily use across macOS and Windows. Two known debts, both documented in the README with fix plans: the client still holds the MongoDB credential (encrypted, but that's obfuscation — the threat model says so explicitly), and there is no automated test suite; the only gate is a syntax check across every JS file.",
    decision: "Document weaknesses like an engineer, not a marketer: the README ships a full threat model with three ranked remediation options and effort estimates.",
  },
  {
    phase: "08 · Roadmap",
    title: "What the next six months buy",
    body: "First: a small backend API + JWT so the DB credential leaves the client entirely (~1 day, already specified endpoint-by-endpoint in the README). Second: the test suite this SDET's own product deserves — Playwright driving the renderer, node:test on the store layer, in CI. Third: auto-update, so 278 builds stop being 278 manual installs.",
    decision: "Security debt outranks feature work — the JWT migration was scoped so the IPC interface doesn't change, only the transport under it.",
  },
];

/* --------------------------- Engineering highlights ------------------------ */

export interface Highlight {
  readonly id: string;
  readonly title: string;
  readonly file: string;
  readonly problem: string;
  readonly implementation: string;
  readonly why: string;
  readonly tradeoff: string;
  readonly lesson: string;
  readonly code: string;
}

export const BEACON_HIGHLIGHTS: readonly Highlight[] = [
  {
    id: "git",
    title: "A git layer that can't be abused",
    file: "src/main/features/git/git-store.js",
    problem: "The AI proposes diffs and the app applies them — so the layer touching the user's repository is the most dangerous code in the system. One string-interpolated command is one injection away from disaster.",
    implementation: "Dedicated handlers with fixed argument vectors — no shell, no string building. Branch names must match a strict regex. Patches are piped through stdin, never written as temp files. Force-push doesn't exist as a code path.",
    why: "Safe by construction beats safe by validation: destructive operations weren't guarded — they were never implemented. There is no code path to sanitize.",
    tradeoff: "Every git capability needs its own handler instead of one generic runner. More code, but each handler is independently auditable.",
    lesson: "Security you design out is stronger than security you bolt on. The comment in the file says it plainly: 'destructive operations simply don't exist here.'",
    code: `const BRANCH_RE = /^[\\w][\\w./-]{0,200}$/;

// fixed argv — no shell, no interpolation; patch arrives via stdin
function runGit(cwd, args, { stdin = null, timeout = 60000 } = {}) {
  const child = spawn(resolveGit(), args, { cwd, timeout, windowsHide: true });
  // …streams capped at 2MB, structured {code, out, err} result
  if (stdin != null) child.stdin.write(stdin);
  child.stdin.end();
}`,
  },
  {
    id: "cli",
    title: "Claude CLI as a cross-platform engine",
    file: "src/main/features/ai/claude-cli.js",
    problem: "GUI apps launch with a minimal PATH, Windows installs Claude as a .cmd shim that Node refuses to spawn directly, and shell mode reopens the injection question. The AI engine has to be reliable on every machine, or every ✦ feature dies.",
    implementation: "Binary resolution scans PATH plus known install dirs per platform (Homebrew, npm global, scoop). .cmd shims run through a shell — but user content never touches the command line: prompts are piped via stdin, and the model flag is regex-validated. Token usage rides a side-channel so callers keep receiving plain text.",
    why: "Using the CLI instead of the API means zero key management (it's the engineer's own login) and real code-reading during review when run with the repo as cwd.",
    tradeoff: "A hard dependency on Claude Code being installed — accepted, and handled: ai:check probes the binary and the UI degrades gracefully.",
    lesson: "The gap between 'works in dev' and 'works as a packaged GUI app on a colleague's Windows laptop' is where platform engineering actually lives.",
    code: `// .cmd shims need a shell; user content goes through stdin, never argv
const cmd = bin.useShell ? \`"\${bin.file}"\` : bin.file;
const child = spawn(cmd, args, { shell: bin.useShell, cwd: workDir, timeout });

// usage rides a side-channel so every caller keeps receiving plain text
e.sender.send('ai:usage', { model, inTok, cacheTok, outTok, cost });`,
  },
  {
    id: "sync",
    title: "Sync that can't wipe your other machine",
    file: "src/main/features/reminders/reminders-store.js",
    problem: "The first sync implementation replaced the whole collection per save. Two machines, one stale — and a week of reminders vanished. A single-user tool still has distributed-systems problems.",
    implementation: "Differential sync: bulk upserts keyed by (owner, id) plus deletes targeted to explicit ids — never delete-all/insert-all. Legacy pre-ownership documents are claimed exactly once by the first account that syncs.",
    why: "Concurrent writers can now interleave safely; the worst case is a duplicate upsert, not data loss. The same pattern was then applied to user_data, config, and workspace stores.",
    tradeoff: "Deletions must be tracked client-side as tombstone ids rather than inferred from absence — slightly more bookkeeping for categorically better failure modes.",
    lesson: "The bug taught the principle: never let 'sync' mean 'replace'. Real usage across two machines found what no amount of solo desk-testing would have.",
    code: `// differential sync: upserts keyed by (owner, id); deletes only given ids
for (const r of upserts) {
  ops.push({ replaceOne: {
    filter: { owner, id: r.id },
    replacement: { ...r, owner }, upsert: true } });
}
if (deletes.length)
  ops.push({ deleteMany: { filter: { owner, id: { $in: deletes } } } });
await col.bulkWrite(ops, { ordered: false });`,
  },
  {
    id: "ipc",
    title: "A 60-channel security boundary you can read in one sitting",
    file: "src/preload.js · src/main/window.js",
    problem: "Beacon embeds live GitHub and Jira webviews and renders AI output — a renderer compromise must not become a machine compromise.",
    implementation: "contextIsolation: true, nodeIntegration: false, and a preload bridge that enumerates every capability the UI has: 60 invoke-style channels with verb:object names, JSON in and out. Embedded webviews run in isolated session partitions (persist:github, persist:jira). DevTools for embedded views open in a separate top-level window, gated to admin accounts.",
    why: "The entire attack surface between UI and platform fits in one file a reviewer can audit in minutes. Nothing implicit, nothing dynamic.",
    tradeoff: "Every new feature needs a preload entry and a main-process handler — friction, but that friction is the security model working as designed.",
    lesson: "An explicit contract at a trust boundary is worth more than any amount of after-the-fact sandboxing.",
    code: `new BrowserWindow({ webPreferences: {
  contextIsolation: true,     // renderer cannot reach Node
  nodeIntegration:  false,
  preload: path.join(__dirname, '..', 'preload.js'),
}});
// preload: the whole UI capability surface, explicitly enumerated
contextBridge.exposeInMainWorld('api', {
  aiClaude:      (p) => ipcRenderer.invoke('ai:claude', p),
  gitCheckout:   (p) => ipcRenderer.invoke('git:checkout', p),
  remindersSync: (p) => ipcRenderer.invoke('reminders:sync', p), /* …57 more */ });`,
  },
  {
    id: "offline",
    title: "Offline-first without a sync framework",
    file: "src/main/db/mongo.js · workspace-store.js",
    problem: "A desktop tool that dies when the database is unreachable isn't a tool, it's a liability. But full CRDT-style sync is wildly over-engineered for one user per account.",
    implementation: "A lazy singleton Mongo client with retry-after backoff and a MONGO_OFFLINE fast-fail so calls return instantly instead of hanging. Disk is written first (atomic tmp+rename), Mongo is pushed debounced. The UI polls db:status every 30s and shows a red banner with Retry. On login, timestamps decide: newer side wins, per data kind.",
    why: "Every mechanism is proportional to the actual failure mode: laptop offline, VPN drop, Atlas hiccup. No new dependency, ~100 lines total.",
    tradeoff: "Last-write-wins can lose an edit if the same account edits two machines offline simultaneously — documented, accepted for a single-user-per-account tool, and the event log uses longer-wins instead because appends shouldn't fight.",
    lesson: "Choosing the right consistency model for the actual use case is the engineering. CRDTs would have been résumé-driven development here.",
    code: `// fast-fail while a (re)connect is pending — the UI shows a banner
if (connecting) throw Object.assign(new Error('MONGO_OFFLINE'),
                                    { code: 'MONGO_OFFLINE' });
// retry-after backoff: don't hammer Atlas on a flaky VPN
if (Date.now() - lastFailAt < 10_000) throw offline();`,
  },
  {
    id: "secrets",
    title: "Secrets engineering with an honest threat model",
    file: "src/main/db/env-crypt.js · token-store.js · README.md",
    problem: "A packaged desktop app must ship a database credential and store API tokens — and pretending client-side encryption solves this is the most common security lie in desktop software.",
    implementation: "Three tiers: GitHub/Jira tokens encrypted per-account via the OS keychain (safeStorage). Passwords hashed with scrypt and compared timing-safe. The shipped Mongo URI encrypted AES-256-GCM into .env.enc, decrypted only in memory — and documented, in the code and the README, as obfuscation, because the key derives from an embedded passphrase.",
    why: "The README ships a real threat model: what an attacker with the installer can do, and three ranked fixes with effort estimates (backend API + JWT, ~1 day, is the roadmap head).",
    tradeoff: "Shipping with a known, documented limitation instead of blocking on the backend — right for an internal tool with a trusted distribution list, and stated as exactly that.",
    lesson: "Security maturity isn't having no weaknesses — it's knowing precisely what they are, writing them down, and sequencing the fix. The comment says it: 'this only stops casual extraction.'",
    code: `// Obfuscation-grade encryption for the shipped .env (AES-256-GCM).
// NOTE: the key derives from an embedded passphrase — a determined
// reverse-engineer can recover it. Real protection = backend proxy.
const KEY = crypto.scryptSync('beacon:…:env-v1', 'beacon-env-salt', 32);
function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const c  = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64');
}`,
  },
];

/* ------------------------------ Reflection -------------------------------- */

export interface ReflectionEntry {
  readonly q: string;
  readonly a: string;
}

export const BEACON_REFLECTION: readonly ReflectionEntry[] = [
  {
    q: "Why build this at all?",
    a: "Partly to fix my own mornings. But mostly because my other AI work — the test-automation platform — automates a pipeline. I wanted to know if I could build an AI product: something with users, accounts, onboarding, themes, i18n, installers, and all the unglamorous engineering that pipelines never need. Beacon is where I learned the difference.",
  },
  {
    q: "What did I initially misunderstand?",
    a: "I thought the hard part would be the AI. It wasn't — Claude integration took days. The hard parts were sync (my first implementation could wipe a machine's data), packaging (unsigned macOS builds, Windows .cmd shims, minimal GUI PATHs), and the discipline of making AI trustworthy: visible cost, no silent posting, graceful degradation.",
  },
  {
    q: "What design decision changed during development?",
    a: "AI autonomy, twice. The first auto-review posted comments directly to GitHub — technically impressive, socially wrong; teammates deserve to know what's machine-written and I made auto-post opt-in. The planner went the other way: it started as suggestions-only and earned more autonomy through the block state ladder, because it proved itself with measured beliefs instead of vibes.",
  },
  {
    q: "Which part am I most proud of?",
    a: "The wiring, not any single feature. A PR merging completes its plan block. A ticket hitting Done closes its schedule entry. A note becomes reminders with source chips pointing back. That cross-cutting integrity — one system, not twelve views — is the thing no existing tool gave me.",
  },
  {
    q: "Which part would I redesign today?",
    a: "The renderer's shared-global-scope architecture. Forty-four classic scripts sharing one namespace was a deliberate zero-build-step bet, and it kept iteration fast to about 10K lines — past that, implicit coupling costs more than the missing build step saved. ES modules and a typed IPC contract are the refactor.",
  },
  {
    q: "The uncomfortable one: an SDET shipped a product with zero tests?",
    a: "Yes — and I won't pretend it was strategy. It was solo-project momentum, and it's exactly the trap I help teams escape at work. The honest analysis: with one daily user, production was my test suite and the feedback loop was minutes. But the sync-wipe bug is precisely the regression a store-layer test would have caught in CI instead of in my data. Beacon is now the first candidate for its own medicine — my AI test platform generating its regression suite is the plan, and there's poetry in that.",
  },
  {
    q: "How did this change me as an engineer?",
    a: "It moved me from 'automation engineer who uses AI' to 'engineer who designs systems where AI is a governed component'. Every discipline Beacon enforces — visible cost, explicit contracts, human-owned merges — is now how I evaluate any AI system, including the ones I build at work.",
  },
];

/* ------------------------------ Demo scenes ------------------------------- */

export interface DemoScene {
  readonly id: string;
  readonly nav: string;
  readonly icon: string;
  readonly crumb: string;
  readonly caption: string;
  readonly hotspots: readonly { readonly title: string; readonly body: string }[];
}

export const DEMO_SCENES: readonly DemoScene[] = [
  {
    id: "brief",
    nav: "Dashboard",
    icon: "◈",
    crumb: "Dashboard",
    caption: "The AI Daily Brief — a deterministic base (every number exact, computed instantly) with Claude's narrative on top. Cache-first: yesterday's brief paints immediately, the fresh one streams in behind it.",
    hotspots: [
      { title: "Deterministic base", body: "Focus score, plan confidence, and estimated finish are computed locally — the brief never blocks on AI, and never hallucinates a number." },
      { title: "Claude narrative", body: "The 'today's read' is generated in your UI language and cached per workspace per day; the other language is pre-generated in the background so switching EN↔VI is instant." },
    ],
  },
  {
    id: "github",
    nav: "GitHub",
    icon: "⑂",
    crumb: "GitHub › beacon",
    caption: "Multi-repo review queue. The repo being viewed is fetched deeply; the others watch page 1 to flag new PRs. Claude pre-reviews everything that requests you, with the team's Knowledge Hub as context.",
    hotspots: [
      { title: "Auto AI review", body: "New PRs requesting your review are queued and reviewed one Claude run at a time — findings saved with history, re-reviewed on new commits with a 60s settle window." },
      { title: "SLA nudges", body: "A PR waiting on you past the threshold (default 4h) nudges once, escalates at 24h — across all active repos, not just the one on screen." },
    ],
  },
  {
    id: "plan",
    nav: "Plan",
    icon: "☰",
    crumb: "Plan › Today",
    caption: "The Adaptive Planner. A pure-algorithm solver places work around meetings and lunch; AI Plan classifies tickets by your role and splits big ones across days. Everything arrives as Reserved — the machine proposes, you decide.",
    hotspots: [
      { title: "Block state ladder", body: "Reserved (dashed — engine moves it freely) → Accepted → Placed (you dragged it) → Locked. Changes to accepted blocks go through a diff you approve." },
      { title: "Beliefs", body: "The engine measures your real minutes-per-point, review time, and golden hours — and only trusts them once there's enough sample." },
    ],
  },
  {
    id: "calendar",
    nav: "Calendar",
    icon: "▦",
    crumb: "Calendar › Week",
    caption: "Events are terrain for the planner: dragging a meeting makes the plan route around it. Engine blocks from the published plan show dashed, reminders show as amber pips, and the 08→20 grid auto-expands when something falls outside it.",
    hotspots: [
      { title: "Events as terrain", body: "The solver never fights your calendar — meetings get prep and recovery margins, lunch is protected, and moving an event triggers a quiet re-plan proposal, not a silent rewrite." },
      { title: "One surface, three layers", body: "Solid events, dashed engine blocks from the published plan, and reminder pips share one grid — the same data the Plan module sees, in calendar form. Friday carries the 50% margin-day rule." },
    ],
  },
  {
    id: "reminders",
    nav: "Reminders",
    icon: "◷",
    crumb: "Reminders",
    caption: "Reminders with a duration become Reserved blocks in Plan — completing either side completes the other (two-way lockstep). Repeat rules cover daily, weekly by weekday, and monthly with auto-clamping for short months.",
    hotspots: [
      { title: "✦ AI create", body: "Type naturally — 'deploy checklist Fri 3pm, 45 min' — and the AI fills in time, repeat, and duration. The parsed result is shown for you to confirm, never silently saved." },
      { title: "Two-way lockstep", body: "A reminder with a duration is also a plan block. Tick the reminder → the block completes; finish the block in Focus mode → the reminder completes. One source of truth, two views." },
    ],
  },
  {
    id: "sprint",
    nav: "Sprint",
    icon: "◔",
    crumb: "Sprint › WAYPOINT",
    caption: "Jira sprint health with a forecast the board can't give you: points remaining × your measured velocity vs. hours actually left, QA share counted at 50%. Standups draft themselves from real activity.",
    hotspots: [
      { title: "My forecast", body: "Coverage percentage plus the riskiest ticket, flowing from the same measured beliefs the planner uses — one model of you, shared across modules." },
      { title: "Ceremonies", body: "⌘⇧S drafts a standup from yesterday's completed tickets, plan items, deep-work hours, PRs, and blockers — then ✦ polishes it with Claude." },
    ],
  },
  {
    id: "notes",
    nav: "Notes",
    icon: "✎",
    crumb: "Notes",
    caption: "Markdown-lite notes, pinnable, always opening in view mode. The ✦ AI note flow is the interesting part: write as you think, and the AI builds a structured note and extracts plan items and reminders — each carrying a source chip pointing back to the note.",
    hotspots: [
      { title: "✦ AI extraction", body: "Plan items must carry an estimate and reminders must carry a time before the AI is allowed to create them — extraction follows the same discipline as every other AI feature: structured, inspectable, reversible." },
      { title: "Source chips", body: "Every extracted item keeps a chip linking back to its origin note. Three weeks later, when a plan block asks 'why does this exist?', the answer is one click away." },
    ],
  },
  {
    id: "knowledge",
    nav: "Knowledge",
    icon: "◆",
    crumb: "Knowledge › beacon",
    caption: "Per-repo team knowledge — docs, rules, agents — stored in MongoDB so a second machine needs no re-import, compiled down to local-only Claude skills (via .git/info/exclude, never committed). This is what makes the AI review context-aware instead of generic.",
    hotspots: [
      { title: "✦ Learn from reviews", body: "The AI reads ~100 of the team's most recent review comments and proposes recurring rules (each tagged ×N times seen). You approve ✓ or reject ✕ — the team's own history trains its reviewer." },
      { title: "Import = packaging", body: "Importing an agent isn't a reference — the AI follows every skill, sub-agent, and command the agent calls, reads them verbatim, and stores a 📦 package so every run ships with its full context." },
    ],
  },
];

/* ------------------------------ Stack & links ------------------------------ */

export const BEACON_STACK: readonly string[] = [
  "Electron 33",
  "Vanilla JavaScript",
  "Node.js",
  "MongoDB",
  "Claude Code CLI",
  "GitHub REST API",
  "Jira Cloud API",
  "electron-builder",
  "AES-256-GCM",
  "OS Keychain (safeStorage)",
];

export interface CrossLink {
  readonly title: string;
  readonly href: string;
  readonly relation: string;
}

export const BEACON_CROSSLINKS: readonly CrossLink[] = [
  {
    title: "AI-Powered Test Automation Platform",
    href: "/#ai-platform",
    relation: "Beacon's sibling. The platform automates a pipeline (ticket → PR); Beacon productizes the same philosophy — AI as a governed engineering component — for an engineer's whole day. The discipline is identical: visible cost, explicit contracts, humans own the merge.",
  },
  {
    title: "Enterprise Playwright Automation Framework",
    href: "/#work",
    relation: "Where the platform thinking started: solve a class of problems once, make developer experience the adoption driver. Beacon's feature-store architecture and token-based design system apply the same principle to product code.",
  },
  {
    title: "Enterprise Test Infrastructure",
    href: "/#work",
    relation: "The reliability engineering — flaky-test quarantine, cross-platform execution — that shaped Beacon's offline-first sync and its cross-platform packaging battle scars. And the reason Beacon's missing test suite is named, not hidden.",
  },
];

export const BEACON_STORY =
  "Read in sequence, the projects tell one story: first I built tests, then I built the framework that writes tests, then the infrastructure that runs them, then a platform where AI generates them — and Beacon is the thesis applied to everything: platforms and systems, not just applications.";
