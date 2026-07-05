import { RefreshCw } from "lucide-react";

import { DiagramFrame, DiagramLabel, FlowArrow } from "@/components/diagrams/primitives";
import { AGENTS, SEQUENCE } from "@/constants/data";

/* ==========================================================================
   Agent Orchestration Architecture
   Inputs (MCP) → Orchestrator → specialized agents (with self-correction
   loop) → emitted artifacts. The system's core diagram.
   ========================================================================== */

export function AgentOrchestrationDiagram() {
  return (
    <DiagramFrame
      label="Agent orchestration architecture: context enters through Jira and Confluence MCP connectors into an orchestrator built on the Claude Agent SDK, n8n and YAML workflows; the orchestrator coordinates six specialized agents with a self-correction loop, and emits Playwright tests, a Git branch and pull request, and a Jira comment."
      className="border border-white/[0.08] bg-bg-deeper p-[clamp(22px,3vw,38px)]"
    >
      <DiagramLabel align="center" className="mb-3">
        Context in · via Model Context Protocol
      </DiagramLabel>
      <ul className="mb-2 flex flex-wrap justify-center gap-3">
        {["Jira MCP", "Confluence MCP"].map((mcp) => (
          <li
            key={mcp}
            className="rounded-[10px] border border-white/10 bg-surface-raised px-[18px] py-2.5 font-mono text-[13px] text-fg-strong"
          >
            {mcp}
          </li>
        ))}
      </ul>

      <FlowArrow className="my-1" />

      <div className="mx-auto max-w-[560px] rounded-xl border border-accent/40 bg-accent/10 px-5 py-4 text-center">
        <p className="text-base font-semibold text-white">Orchestrator</p>
        <p className="mt-0.5 font-mono text-xs text-accent-soft">
          Claude Agent SDK · n8n · YAML workflows
        </p>
      </div>

      <FlowArrow className="my-1.5" />

      <ul className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-3">
        {AGENTS.map((agent) => (
          <li
            key={agent.tag}
            className="rounded-[11px] border border-accent/[0.28] bg-accent/[0.06] px-3.5 py-4"
          >
            <p className="mb-[7px] font-mono text-[10.5px] text-accent">{agent.tag}</p>
            <p className="text-sm font-semibold leading-tight text-white">{agent.name}</p>
            <p className="mt-1.5 text-xs leading-[1.45] text-fg-subtle">{agent.role}</p>
          </li>
        ))}
      </ul>

      <p className="my-2.5 flex items-center justify-center gap-2 rounded-lg border border-dashed border-accent/30 bg-accent/[0.05] p-2 text-center">
        <RefreshCw size={15} className="flex-none text-accent-soft" aria-hidden />
        <span className="text-[12.5px] text-accent-soft">
          Self-correction loop — Failure Analyst feeds fixes back to the Test Generator
        </span>
      </p>

      <FlowArrow className="my-1.5" />

      <DiagramLabel align="center" className="mb-3">
        Artifacts out
      </DiagramLabel>
      <ul className="flex flex-wrap justify-center gap-3">
        <li className="rounded-[10px] border border-white/10 bg-surface-raised px-[18px] py-2.5 font-mono text-[13px] text-fg-strong">
          Playwright Tests
        </li>
        <li className="rounded-[10px] border border-success/25 bg-surface-raised px-[18px] py-2.5 font-mono text-[13px] text-success-soft">
          Git Branch + PR
        </li>
        <li className="rounded-[10px] border border-white/10 bg-surface-raised px-[18px] py-2.5 font-mono text-[13px] text-fg-strong">
          Jira Comment
        </li>
      </ul>
    </DiagramFrame>
  );
}

/* ==========================================================================
   Execution Sequence · Ticket → PR
   Ordered, numbered timeline of the seven pipeline stages.
   ========================================================================== */

export function ExecutionSequenceDiagram() {
  return (
    <DiagramFrame
      label="Execution sequence from Jira ticket to pull request across seven stages, each performed by a specific agent or connector."
      className="border border-white/[0.08] bg-bg-deeper p-[clamp(20px,3vw,32px)]"
    >
      <div className="relative pl-[34px]">
        <span
          aria-hidden
          className="absolute bottom-2 left-[9px] top-2 w-px bg-gradient-to-b from-accent/50 to-accent/[0.08]"
        />
        <ol className="flex flex-col gap-4">
          {SEQUENCE.map((step) => (
            <li key={step.n} className="relative">
              <span
                aria-hidden
                className="absolute -left-[34px] top-0.5 flex size-[19px] items-center justify-center rounded-full border-2 border-accent/50 bg-bg-deeper font-mono text-[10px] text-accent-soft"
              >
                {step.n}
              </span>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-[15px] font-semibold text-white">{step.title}</span>
                <span className="rounded-[5px] border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-[10.5px] text-accent-soft">
                  {step.actor}
                </span>
              </div>
              <p className="mt-1.5 text-caption leading-[1.55] text-fg-subtle">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </DiagramFrame>
  );
}
