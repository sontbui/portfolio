import type {
  Agent,
  CiStage,
  Decision,
  ExperienceRole,
  FrameworkLayer,
  Metric,
  PipelineStep,
  Principle,
  SequenceStep,
  Skill,
  SkillGroup,
  SkillLevel,
} from "@/types";

/* ==========================================================================
   PORTFOLIO CONTENT
   Extracted verbatim from the approved design. Presentation lives in
   components; this module is the single source of truth for copy & data.
   ========================================================================== */

/** Rotating pipeline preview shown in the hero terminal card. */
export const HERO_STEPS: readonly PipelineStep[] = [
  { n: "1", label: "Analyze ticket & requirements" },
  { n: "2", label: "Retrieve project knowledge" },
  { n: "3", label: "Generate Playwright tests" },
  { n: "4", label: "Execute & triage failures" },
  { n: "5", label: "Self-correct flaky tests" },
  { n: "6", label: "Open PR & update Jira" },
];

export const PHILOSOPHY =
  "Automation is software engineering. I measure success not by the number of tests I write, but by how much engineering effort my platforms eliminate.";

/* -------------------------------- AI Platform ---------------------------- */

export const AI_PLATFORM = {
  eyebrow: "Flagship Project · Proof of Concept",
  title: "AI-Powered Test Automation Platform",
  summary:
    "A multi-agent system that automates the journey from a Jira ticket to a production-ready automation pull request — requirement analysis, test generation, execution, failure triage, and delivery, orchestrated end to end.",
  problem: {
    title: "The Problem",
    body: "Test automation is treated as a manual engineering workflow: read the ticket, understand requirements, write the test, run it, debug the failure, open the PR. Every step is repetitive, and every engineer does it slightly differently — the effort scales linearly with the work.",
  },
  insight: {
    title: "The Insight",
    body: "Treat AI not as a coding assistant but as an engineering component — specialized agents that each own a stage of the lifecycle and collaborate through a shared orchestration layer, with context supplied by MCP. The goal isn't more tests; it's removing the repetitive engineering between a requirement and its verification.",
  },
  status: "Status: Proof of Concept — actively expanding",
} as const;

export const AGENTS: readonly Agent[] = [
  { tag: "AGENT_01", name: "Requirement Analyst", role: "Normalizes the ticket into testable requirements" },
  { tag: "AGENT_02", name: "Knowledge Retriever", role: "Pulls project context from Jira & Confluence" },
  { tag: "AGENT_03", name: "Test Generator", role: "Writes Playwright (TypeScript) automation" },
  { tag: "AGENT_04", name: "Executor", role: "Runs the suite and captures results" },
  { tag: "AGENT_05", name: "Failure Analyst", role: "Separates automation issues from real defects" },
  { tag: "AGENT_06", name: "PR Author", role: "Creates branch, commits, PR & Jira comment" },
];

export const SEQUENCE: readonly SequenceStep[] = [
  { n: "1", title: "Ticket received", actor: "Jira MCP", detail: "A Jira ticket enters the pipeline; requirements are normalized into a testable spec." },
  { n: "2", title: "Context retrieved", actor: "Knowledge Retriever", detail: "Relevant project knowledge is pulled from Jira & Confluence to ground generation." },
  { n: "3", title: "Tests generated", actor: "Test Generator", detail: "Playwright TypeScript tests are authored from the requirements and context." },
  { n: "4", title: "Suite executed", actor: "Executor", detail: "Automation runs; results, traces, and failures are collected." },
  { n: "5", title: "Failures triaged", actor: "Failure Analyst", detail: "Each failure is classified: automation issue vs. genuine product defect." },
  { n: "6", title: "Self-correction loop", actor: "Generator ↺", detail: "Flaky or fixable automation is corrected and re-run automatically before delivery." },
  { n: "7", title: "Delivered", actor: "PR Author", detail: "Branch, commits, and PR are created and the Jira ticket is updated — ready for human review." },
];

export const DECISIONS: readonly Decision[] = [
  { title: "AI as an engineering component, not an assistant", body: "Each agent owns one lifecycle stage with a clear contract, so the system is composable and debuggable — not a single opaque prompt." },
  { title: "MCP for context, not scraping", body: "Model Context Protocol gives agents structured access to Jira & Confluence, keeping context accurate and integration maintainable." },
  { title: "Human-in-the-loop at the PR", body: "The platform stops at a pull request. Delivery stays reviewable — AI does the repetitive work, engineers own the merge." },
  { title: "Orchestration via n8n + YAML", body: "Declarative workflows make the pipeline transparent and easy to extend without rewriting agent logic." },
];

export const AI_METRICS: readonly Metric[] = [
  { value: "~20 min", label: "Ticket → PR for a typical task (~10 test cases), measured in POC runs" },
  { value: "6 agents", label: "Specialized agents collaborating across the testing lifecycle" },
  { value: "End-to-end", label: "Requirement analysis through PR — no manual step in between" },
];

export const AI_FUTURE: readonly string[] = [
  "Broaden coverage beyond Playwright to desktop/API generation.",
  "Confidence scoring so the platform knows when to defer to a human.",
  "Richer failure analytics feeding suite-health trends.",
];

export const AI_STACK: readonly string[] = [
  "Claude Agent SDK",
  "Model Context Protocol",
  "Jira MCP",
  "Confluence MCP",
  "Playwright",
  "TypeScript",
  "n8n",
  "YAML",
  "Git Automation",
];

/* -------------------------------- Impact bar ----------------------------- */

export const BIG_METRICS: readonly Metric[] = [
  { value: "0→80%", label: "Automation coverage on the targeted product" },
  { value: "~700", label: "Cross-platform automated tests (Win / macOS / Linux)" },
  { value: "−70%", label: "Regression execution time" },
  { value: "150→<20", label: "Flaky tests, via detection & quarantine" },
  { value: "−40%", label: "Manual testing effort (estimated)" },
];

/* -------------------------------- Selected work -------------------------- */

export const FRAMEWORK_LAYERS: readonly FrameworkLayer[] = [
  { name: "Test Specs", tag: "UI · API · Backend", items: "Readable, intent-focused test cases" },
  { name: "Fixtures", tag: "lifecycle", items: "Setup/teardown, auth, shared state" },
  { name: "Page & Component Objects", tag: "abstraction", items: "Encapsulated selectors and interactions" },
  { name: "Core Utilities", tag: "shared", items: "Helpers, data builders, API clients" },
  { name: "Config & Reporting", tag: "platform", items: "Environments, parallelism, CI integration" },
];

export const CI_PIPELINE: readonly CiStage[] = [
  { label: "Commit", arrow: true },
  { label: "Build", arrow: true },
  { label: "OS Matrix", arrow: true },
  { label: "Parallel Run", arrow: true },
  { label: "Aggregate", arrow: true },
  { label: "Flaky Gate", arrow: false },
];

/* -------------------------------- Selected work: copy -------------------- */

export interface DetailBlock {
  readonly label: string;
  readonly body: string;
}

export const WORK = {
  eyebrow: "Selected Work",
  title: "Platforms & infrastructure",
  description:
    "Enterprise work is presented through original architecture diagrams — the engineering, without proprietary detail.",
  playwright: {
    index: "02",
    context: "Enterprise · OPSWAT",
    title: "Enterprise Playwright Automation Framework",
    summary:
      "A reusable Playwright + TypeScript framework covering UI, API, and backend testing that moved the team from a fully manual process to scalable hybrid automation.",
    details: [
      { label: "Problem", body: "Manual regression didn't scale and produced inconsistent coverage across enterprise products spanning multiple platforms." },
      { label: "Key trade-off", body: "Chose a fixture-driven architecture with shared utilities over per-suite convenience — more upfront design, but reuse and maintainability that compounds across every product." },
      { label: "Lesson", body: "A framework is a product for engineers — developer experience (clear fixtures, fast feedback, readable reports) is what drives real adoption." },
    ] satisfies DetailBlock[],
  },
  infrastructure: {
    index: "03",
    context: "Enterprise · OPSWAT",
    badge: "representative model",
    title: "Enterprise Test Infrastructure",
    summary:
      "The platform behind the tests: Playwright (web) and Squish (desktop) unified into one cross-platform execution and reporting ecosystem across Windows, macOS, and Linux.",
    details: [
      { label: "Context", body: "Cybersecurity products aren't standard web apps — many are desktop applications that must be validated across three operating systems, which web-only tooling can't cover." },
      { label: "Approach", body: "Playwright for web and Squish for desktop/Qt GUIs feed a shared orchestration and reporting layer, so a heterogeneous suite reads as one signal to the team." },
      { label: "Reliability", body: "A flaky-test feedback loop — retry, quarantine, and trend analysis — took the suite from ~150 unstable tests to fewer than 20." },
    ] satisfies DetailBlock[],
  },
  ecommerce: {
    index: "04",
    context: "Personal · Full-Stack",
    title: "E-Commerce Platform",
    summary:
      "A full-stack project built to deepen backend engineering — REST API design, authentication, and automated UI testing — applying software-engineering principles beyond testing.",
    note: "Selenium exercises the UI end-to-end — automated regression on the full stack",
  },
} as const;

/* -------------------------------- Experience ----------------------------- */

export const EXPERIENCE: readonly ExperienceRole[] = [
  {
    role: "Associate Software Engineer in Test (SDET)",
    company: "OPSWAT Vietnam",
    industry: "Enterprise Cybersecurity",
    period: "Nov 2024 — Present",
    points: [
      "Designed and built the team's reusable Playwright + TypeScript framework, moving from a fully manual process to scalable hybrid automation.",
      "Architected an AI-powered automation POC (Claude Agent SDK, MCP, n8n) automating the path from Jira ticket to pull request.",
      "Established automation architecture and engineering standards; reviewed automation design across the team.",
      "Grew coverage 0→~80% with ~700 cross-platform tests; cut regression time ~70% and flaky tests from ~150 to <20.",
    ],
    tech: ["Playwright", "TypeScript", "Squish", "Claude Agent SDK", "MCP", "n8n", "CI/CD"],
  },
  {
    role: "Front-end Developer (Contract)",
    company: "Rovi Holdings Investment JSC",
    industry: "Technology & Investment",
    period: "Sep 2024 — Oct 2024",
    points: [
      "Built responsive, type-safe React components that improved maintainability and reduced duplication.",
      "Integrated backend APIs and contributed to requirement analysis, testing, and debugging.",
      "Delivered contract scope on a short timeline without sacrificing code quality.",
    ],
    tech: ["React", "TypeScript", "Material UI"],
  },
];

/* -------------------------------- Approach ------------------------------- */

export const PRINCIPLES: readonly Principle[] = [
  { title: "Build maintainable systems over quick fixes", body: "Design for the teammate who extends it in six months, not the demo today." },
  { title: "Design reusable frameworks, not duplicated solutions", body: "Solve a class of problems once; let the platform scale it." },
  { title: "Automate workflows, not just test cases", body: "The biggest wins come from removing whole steps, not scripting one." },
  { title: "Developer experience is a first-class concern", body: "Fast feedback and clear reporting are what make automation actually get used." },
  { title: "Use AI to augment engineering, not replace thinking", body: "AI handles the repetitive; engineers keep ownership of judgment." },
];

/* -------------------------------- Skills --------------------------------- */

const skill = (name: string, level: SkillLevel, strength: Skill["strength"]): Skill => ({
  name,
  level,
  strength,
});

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    title: "Automation & Testing",
    items: [
      skill("Playwright", "Advanced", 4),
      skill("Squish (Desktop)", "Advanced", 3),
      skill("Selenium", "Proficient", 3),
      skill("API & Contract Testing", "Advanced", 4),
      skill("Test Data Management", "Proficient", 3),
    ],
  },
  {
    title: "AI & Platforms",
    items: [
      skill("Claude Agent SDK", "Proficient", 3),
      skill("Model Context Protocol", "Proficient", 3),
      skill("n8n Workflows", "Proficient", 3),
      skill("AI Agent Design", "Growing", 3),
    ],
  },
  {
    title: "Languages & Backend",
    items: [
      skill("TypeScript", "Advanced", 4),
      skill("Java", "Proficient", 3),
      skill("Spring Boot", "Proficient", 3),
      skill("MySQL", "Proficient", 3),
    ],
  },
  {
    title: "DevOps & Tooling",
    items: [
      skill("CI/CD Pipelines", "Advanced", 4),
      skill("Git Automation", "Advanced", 4),
      skill("Docker", "Proficient", 3),
      skill("Linux", "Proficient", 3),
    ],
  },
];
