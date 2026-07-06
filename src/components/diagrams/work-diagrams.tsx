import { Check } from "lucide-react";

import { DiagramFrame, DiagramLabel, DiagramNode, FlowArrow } from "@/components/diagrams/primitives";
import { Tag } from "@/components/ui/tag";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { connectorIn, fadeInScale, riseSm, STAGGER } from "@/constants/motion";
import { CI_PIPELINE, FRAMEWORK_LAYERS } from "@/constants/data";

/* ==========================================================================
   Project architecture diagrams.
   Each assembles itself when its pane scrolls into view: nodes settle in the
   direction data flows and connectors pop between them, so the architecture
   reads as *built* rather than merely drawn. All motion no-ops under reduced
   motion via the Reveal/Stagger primitives.
   ========================================================================== */

/* -------- Project 03: Layered framework architecture + parallel exec ------ */

export function LayeredArchitectureDiagram() {
  return (
    <DiagramFrame label="Layered test-framework architecture, from test specs down to config and reporting, followed by the parallel execution model">
      <DiagramLabel className="mb-4">Layered Architecture</DiagramLabel>
      <Stagger as="ol" stagger={STAGGER.base} className="mb-[22px] flex flex-col gap-2">
        {FRAMEWORK_LAYERS.map((layer) => (
          <Reveal
            as="li"
            key={layer.name}
            item
            variants={riseSm}
            className="rounded-[9px] border border-white/[0.09] bg-surface-raised px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2.5">
              <span className="text-caption font-semibold text-white">{layer.name}</span>
              <span className="font-mono text-[11px] text-fg-ghost">{layer.tag}</span>
            </div>
            <p className="mt-1 text-[12.5px] leading-[1.45] text-fg-subtle">{layer.items}</p>
          </Reveal>
        ))}
      </Stagger>

      <DiagramLabel className="mb-3">Parallel Execution</DiagramLabel>
      <Stagger stagger={STAGGER.tight} className="flex flex-wrap items-center gap-2">
        <Reveal as="div" item variants={fadeInScale}>
          <Tag tone="neutral" size="sm" className="whitespace-nowrap">
            1 codebase
          </Tag>
        </Reveal>
        <Reveal as="div" item variants={connectorIn}>
          <FlowArrow direction="right" />
        </Reveal>
        <Reveal as="div" item variants={fadeInScale}>
          <Tag tone="brand" size="sm" className="whitespace-nowrap">
            N shards
          </Tag>
        </Reveal>
        <Reveal as="div" item variants={connectorIn}>
          <FlowArrow direction="right" />
        </Reveal>
        <Reveal as="div" item variants={fadeInScale}>
          <Tag tone="success" size="sm" className="whitespace-nowrap">
            merged report
          </Tag>
        </Reveal>
      </Stagger>
    </DiagramFrame>
  );
}

/* -------- Project 04: Cross-platform system architecture + CI/CD ---------- */

export function TestInfrastructureDiagram() {
  return (
    <DiagramFrame label="Cross-platform test infrastructure: web and desktop runners feed a shared orchestration layer, execute across three operating systems, and produce unified reporting; followed by the CI/CD pipeline stages">
      <DiagramLabel className="mb-4">System Architecture</DiagramLabel>

      <Stagger stagger={STAGGER.base}>
        {/* Sources */}
        <Reveal as="div" item variants={fadeInScale} className="mb-2 flex gap-2.5">
          <DiagramNode className="flex-1" title="Playwright" subtitle="Web / API" />
          <DiagramNode className="flex-1" title="Squish" subtitle="Desktop / Qt" />
        </Reveal>
        <Reveal as="div" item variants={connectorIn}>
          <FlowArrow className="my-0.5" />
        </Reveal>

        {/* Orchestration */}
        <Reveal as="div" item variants={fadeInScale}>
          <DiagramNode tone="brand" title="Orchestration & Test-Data Layer" className="mb-2 py-3.5" />
        </Reveal>
        <Reveal as="div" item variants={connectorIn}>
          <FlowArrow className="my-0.5" />
        </Reveal>

        {/* OS matrix */}
        <Reveal as="ul" item variants={fadeInScale} className="mb-2 flex gap-2">
          {["Windows", "macOS", "Linux"].map((os) => (
            <li key={os} className="flex-1">
              <DiagramNode mono size="sm" title={os} />
            </li>
          ))}
        </Reveal>
        <Reveal as="div" item variants={connectorIn}>
          <FlowArrow className="my-0.5" />
        </Reveal>

        {/* Outputs */}
        <Reveal as="div" item variants={fadeInScale} className="flex gap-2">
          <DiagramNode className="flex-1" size="sm" title="Unified Reporting" />
          <DiagramNode className="flex-1" size="sm" tone="success" title="Flaky Detection" />
        </Reveal>
      </Stagger>

      {/* CI/CD */}
      <DiagramLabel className="mb-3 mt-6">CI/CD Pipeline</DiagramLabel>
      <Stagger as="ol" stagger={STAGGER.tight} className="flex flex-wrap items-center gap-1.5">
        {CI_PIPELINE.map((stage) => (
          <Reveal as="li" key={stage.label} item variants={riseSm} className="flex items-center gap-1.5">
            <span className="whitespace-nowrap rounded-[7px] border border-white/[0.09] bg-surface-raised px-2.5 py-1.5 font-mono text-[11px] text-fg-strong">
              {stage.label}
            </span>
            {stage.arrow ? <FlowArrow direction="right" className="text-[13px]" /> : null}
          </Reveal>
        ))}
      </Stagger>
    </DiagramFrame>
  );
}

/* -------- Project 05: 3-tier full-stack architecture ---------------------- */

export function ThreeTierDiagram({ note }: { note: string }) {
  return (
    <DiagramFrame label="Three-tier full-stack architecture: Angular single-page app, Spring Boot REST API, and MySQL data store, exercised end-to-end by Selenium">
      <DiagramLabel className="mb-4">3-Tier Architecture</DiagramLabel>
      <Stagger stagger={STAGGER.base} className="flex flex-wrap items-stretch gap-2.5">
        <Reveal as="div" item variants={fadeInScale} className="min-w-[150px] flex-1">
          <DiagramNode
            className="h-full !text-left"
            title="Angular SPA"
            subtitle="TypeScript · Material UI"
          />
        </Reveal>
        <Reveal as="div" item variants={connectorIn} className="flex items-center">
          <FlowArrow direction="right" />
        </Reveal>
        <Reveal as="div" item variants={fadeInScale} className="min-w-[150px] flex-1">
          <DiagramNode
            tone="brand"
            className="h-full !text-left"
            title="Spring Boot REST API"
            subtitle="Spring Security · JWT"
          />
        </Reveal>
        <Reveal as="div" item variants={connectorIn} className="flex items-center">
          <FlowArrow direction="right" />
        </Reveal>
        <Reveal as="div" item variants={fadeInScale} className="min-w-[150px] flex-1">
          <DiagramNode className="h-full !text-left" title="MySQL" subtitle="Relational store" />
        </Reveal>
      </Stagger>
      <p className="mt-3 flex items-center gap-2.5 rounded-[9px] border border-dashed border-success/[0.28] bg-success/[0.05] px-3.5 py-2.5">
        <Check size={15} strokeWidth={2} className="flex-none text-success-soft" aria-hidden />
        <span className="text-[13px] text-success-soft">{note}</span>
      </p>
    </DiagramFrame>
  );
}
