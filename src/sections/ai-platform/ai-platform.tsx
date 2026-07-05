import { CircleDot } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { Tag } from "@/components/ui/tag";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import {
  AgentOrchestrationDiagram,
  ExecutionSequenceDiagram,
} from "@/components/diagrams/ai-diagrams";
import { DiagramHeading } from "@/sections/ai-platform/diagram-heading";
import {
  AI_FUTURE,
  AI_METRICS,
  AI_PLATFORM,
  AI_STACK,
  DECISIONS,
} from "@/constants/data";

const SUB_NAV = [
  { href: "#ai-problem", label: "Problem" },
  { href: "#ai-arch", label: "Architecture" },
  { href: "#ai-seq", label: "Workflow" },
  { href: "#ai-tradeoffs", label: "Trade-offs" },
  { href: "#ai-metrics", label: "Metrics" },
  { href: "#ai-next", label: "What's next" },
] as const;

/**
 * Flagship case study — the highest-fidelity section. Composed from focused
 * sub-blocks (problem, architecture, sequence, decisions, metrics, roadmap),
 * each independently revealed and deep-linkable via the in-section sub-nav.
 */
export function AIPlatform() {
  return (
    <Section id="ai-platform" ariaLabelledby="ai-platform-title" className="overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-32 size-[460px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1),transparent_70%)] blur-2xl"
      />
      <Container className="relative">
        {/* Intro */}
        <Reveal>
          <Eyebrow tone="accent" className="mb-[18px]">
            {AI_PLATFORM.eyebrow}
          </Eyebrow>
          <h2
            id="ai-platform-title"
            className="max-w-[800px] text-h1 font-bold leading-[1.05] tracking-[-0.03em] text-balance"
          >
            {AI_PLATFORM.title}
          </h2>
          <p className="mt-[18px] max-w-[var(--prose-max)] text-lead leading-[1.65] text-fg-subtle">
            {AI_PLATFORM.summary}
          </p>
        </Reveal>

        {/* In-section navigation */}
        <nav aria-label="Case study sections" className="mb-10 mt-7 flex flex-wrap gap-1.5">
          {SUB_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/[0.09] bg-surface-raised px-3.5 py-[7px] text-[13px] text-fg-subtle transition-colors hover:border-accent/40 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Problem + insight */}
        <div
          id="ai-problem"
          className="mb-14 grid scroll-mt-[var(--header-h)] grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-5"
        >
          <Reveal>
            <ProblemCard label={AI_PLATFORM.problem.title} body={AI_PLATFORM.problem.body} />
          </Reveal>
          <Reveal delay={0.08}>
            <ProblemCard
              label={AI_PLATFORM.insight.title}
              body={
                <>
                  Treat AI not as a coding assistant but as an{" "}
                  <span className="text-accent-soft">engineering component</span> — specialized
                  agents that each own a stage of the lifecycle and collaborate through a shared
                  orchestration layer, with context supplied by MCP. The goal isn&apos;t more tests;
                  it&apos;s removing the repetitive engineering between a requirement and its
                  verification.
                </>
              }
            />
          </Reveal>
        </div>

        {/* Architecture */}
        <div id="ai-arch" className="mt-12 scroll-mt-[var(--header-h)]">
          <Reveal>
            <DiagramHeading
              title="Agent Orchestration Architecture"
              meta="multi-agent · MCP-connected"
            />
            <AgentOrchestrationDiagram />
          </Reveal>
        </div>

        {/* Sequence */}
        <div id="ai-seq" className="mt-12 scroll-mt-[var(--header-h)]">
          <Reveal>
            <DiagramHeading
              title="Execution Sequence · Ticket → PR"
              meta="~20 min · ~10 test cases"
            />
            <ExecutionSequenceDiagram />
          </Reveal>
        </div>

        {/* Decisions */}
        <div id="ai-tradeoffs" className="mt-12 scroll-mt-[var(--header-h)]">
          <Reveal>
            <DiagramHeading title="Engineering Decisions & Trade-offs" />
          </Reveal>
          <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
            {DECISIONS.map((decision) => (
              <Reveal as="div" key={decision.title} item>
                <Card surface="base" padding="md" className="h-full rounded-xl">
                  <h4 className="mb-2 text-body font-semibold text-white">{decision.title}</h4>
                  <p className="text-sm leading-[1.6] text-fg-subtle">{decision.body}</p>
                </Card>
              </Reveal>
            ))}
          </Stagger>
        </div>

        {/* Metrics */}
        <div id="ai-metrics" className="mt-12 scroll-mt-[var(--header-h)]">
          <Reveal>
            <DiagramHeading title="POC Results" />
          </Reveal>
          <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-3.5">
            {AI_METRICS.map((metric) => (
              <Reveal as="div" key={metric.label} item>
                <div className="h-full rounded-xl border border-accent/[0.18] bg-surface p-6">
                  <p className="text-[length:clamp(30px,4vw,40px)] font-bold leading-none tracking-[-0.03em] text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-caption leading-[1.4] text-fg-subtle">{metric.label}</p>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>

        {/* Roadmap + stack */}
        <div
          id="ai-next"
          className="mt-12 grid scroll-mt-[var(--header-h)] grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-5"
        >
          <Reveal>
            <Card surface="base" padding="md" className="h-full rounded-2xl">
              <Eyebrow tone="muted" className="mb-3.5">
                What&apos;s Next
              </Eyebrow>
              <ul className="flex flex-col gap-2.5">
                {AI_FUTURE.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-[1.55] text-fg-muted"
                  >
                    <span aria-hidden className="mt-1.5 size-[5px] flex-none rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>

          <Reveal delay={0.08}>
            <Card surface="base" padding="md" className="h-full rounded-2xl">
              <Eyebrow tone="muted" className="mb-3.5">
                Stack
              </Eyebrow>
              <ul className="flex flex-wrap gap-2">
                {AI_STACK.map((tech) => (
                  <li key={tech}>
                    <Tag tone="ghost" size="md">
                      {tech}
                    </Tag>
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-[18px] text-[13px] text-fg-subtle">
                <CircleDot size={13} className="text-success" aria-hidden />
                {AI_PLATFORM.status}
              </p>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function ProblemCard({ label, body }: { label: string; body: React.ReactNode }) {
  return (
    <Card surface="base" padding="md" className="h-full rounded-[14px]">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-ghost">
        {label}
      </p>
      <p className="text-[15px] leading-[1.7] text-fg-muted">{body}</p>
    </Card>
  );
}
