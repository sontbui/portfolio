"use client";

import { Github } from "lucide-react";

import {
  AgentOrchestrationDiagram,
  ExecutionSequenceDiagram,
} from "@/components/diagrams/ai-diagrams";
import {
  LayeredArchitectureDiagram,
  TestInfrastructureDiagram,
  ThreeTierDiagram,
} from "@/components/diagrams/work-diagrams";
import { SkillMeter } from "@/components/ui/skill-meter";
import { Tag } from "@/components/ui/tag";
import {
  AI_METRICS,
  AI_PLATFORM,
  BIG_METRICS,
  EXPERIENCE,
  SKILL_GROUPS,
  WORK,
} from "@/constants/data";
import { SOCIALS } from "@/constants/site";
import type { DiagramId, MetricSet, ProjectId } from "@/lib/rag/rich-content";
import type { Metric } from "@/types";

/**
 * Renders a rich portfolio component from a tool invocation. This is where the
 * assistant's "generative UI" plugs into the real, existing components — no
 * duplicated visuals. Unknown tools render nothing (graceful).
 */
export function RichContent({
  toolName,
  args,
}: {
  toolName: string;
  args: Record<string, unknown>;
}) {
  switch (toolName) {
    case "showDiagram":
      return <DiagramById id={args.diagram as DiagramId} />;
    case "showProject":
      return <ProjectCardById id={args.project as ProjectId} />;
    case "showMetrics":
      return <MetricGrid set={args.set as MetricSet} />;
    case "showExperienceTimeline":
      return <MiniTimeline />;
    case "showSkills":
      return <SkillsBlock />;
    default:
      return null;
  }
}

function DiagramById({ id }: { id: DiagramId }) {
  switch (id) {
    case "orchestration":
      return <AgentOrchestrationDiagram />;
    case "sequence":
      return <ExecutionSequenceDiagram />;
    case "layered-architecture":
      return <LayeredArchitectureDiagram />;
    case "test-infrastructure":
      return <TestInfrastructureDiagram />;
    case "three-tier":
      return <ThreeTierDiagram note={WORK.ecommerce.note} />;
    default:
      return null;
  }
}

const PROJECTS: Record<
  ProjectId,
  { title: string; summary: string; stack: readonly string[]; diagram: DiagramId; repo?: string }
> = {
  "ai-platform": {
    title: AI_PLATFORM.title,
    summary: AI_PLATFORM.summary,
    stack: ["Claude Agent SDK", "MCP", "Playwright", "n8n"],
    diagram: "orchestration",
  },
  "automation-framework": {
    title: WORK.playwright.title,
    summary: WORK.playwright.summary,
    stack: ["Playwright", "TypeScript", "Fixtures"],
    diagram: "layered-architecture",
  },
  "test-infrastructure": {
    title: WORK.infrastructure.title,
    summary: WORK.infrastructure.summary,
    stack: ["Playwright", "Squish", "CI/CD"],
    diagram: "test-infrastructure",
  },
  ecommerce: {
    title: WORK.ecommerce.title,
    summary: WORK.ecommerce.summary,
    stack: ["Angular", "Spring Boot", "MySQL", "Selenium"],
    diagram: "three-tier",
    repo: SOCIALS.ecommerceRepo,
  },
};

function ProjectCardById({ id }: { id: ProjectId }) {
  const p = PROJECTS[id];
  if (!p) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-white">{p.title}</h4>
        {p.repo ? (
          <a
            href={p.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[12px] text-fg-subtle hover:text-white"
          >
            <Github size={13} aria-hidden />
            GitHub
          </a>
        ) : null}
      </div>
      <p className="mb-3 text-caption leading-relaxed text-fg-subtle">{p.summary}</p>
      <ul className="mb-3 flex flex-wrap gap-1.5">
        {p.stack.map((t) => (
          <li key={t}>
            <Tag tone="ghost" size="sm">
              {t}
            </Tag>
          </li>
        ))}
      </ul>
      <DiagramById id={p.diagram} />
    </div>
  );
}

function MetricGrid({ set }: { set: MetricSet }) {
  const metrics: readonly Metric[] = set === "poc" ? AI_METRICS : BIG_METRICS;
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {metrics.map((m) => (
        <li key={m.label} className="rounded-lg border border-white/[0.08] bg-surface p-3">
          <p className="text-lg font-bold tracking-tight text-white">{m.value}</p>
          <p className="mt-1 text-[12px] leading-snug text-fg-subtle">{m.label}</p>
        </li>
      ))}
    </ul>
  );
}

function MiniTimeline() {
  return (
    <ol className="flex flex-col gap-3">
      {EXPERIENCE.map((job) => (
        <li key={`${job.company}-${job.period}`} className="rounded-lg border border-white/[0.08] bg-surface p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-1.5">
            <span className="text-sm font-semibold text-white">{job.role}</span>
            <span className="font-mono text-[11px] text-fg-faint">{job.period}</span>
          </div>
          <p className="mt-0.5 text-[12px] text-brand">
            {job.company} <span className="text-fg-ghost">· {job.industry}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}

function SkillsBlock() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SKILL_GROUPS.map((group) => (
        <div key={group.title} className="rounded-lg border border-white/[0.08] bg-surface p-3">
          <h5 className="mb-2.5 text-[13px] font-semibold text-white">{group.title}</h5>
          <div className="flex flex-col gap-2.5">
            {group.items.map((item) => (
              <SkillMeter key={item.name} skill={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
