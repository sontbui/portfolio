"use client";

import { useMemo, useState } from "react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/motion/reveal";
import { DiagramLabel } from "@/components/diagrams/primitives";
import {
  ARCH_LAYERS,
  ARCH_NODES,
  type ArchNode,
  type BeaconLayer,
} from "@/constants/beacon";
import { cn } from "@/lib/utils";

const LAYER_ORDER: readonly BeaconLayer[] = ["renderer", "bridge", "main", "external"];

const LAYER_TONE: Record<BeaconLayer, string> = {
  renderer: "border-brand/[0.28] bg-brand/[0.06]",
  bridge: "border-accent/[0.32] bg-accent/[0.07]",
  main: "border-white/[0.09] bg-surface-raised/60",
  external: "border-success/[0.22] bg-success/[0.04]",
};

/**
 * Interactive architecture explorer. Every component of the real system is a
 * button: hover previews its responsibility, selecting it opens a detail panel
 * with why-it-exists, implementation notes, and clickable dependencies that
 * move the selection — so the system can be understood progressively instead
 * of as one wall of boxes. Fully keyboard operable (they're real buttons).
 */
export function ArchitectureExplorer() {
  const [selectedId, setSelectedId] = useState<string>("bridge-api");

  const selected = useMemo(
    () => ARCH_NODES.find((n) => n.id === selectedId) ?? ARCH_NODES[0]!,
    [selectedId],
  );
  /** ids the selected node depends on + ids that depend on it */
  const related = useMemo(() => {
    const out = new Set(selected.dependsOn);
    for (const n of ARCH_NODES) if (n.dependsOn.includes(selected.id)) out.add(n.id);
    return out;
  }, [selected]);

  const dependents = ARCH_NODES.filter((n) => n.dependsOn.includes(selected.id));

  return (
    <Section id="architecture" ariaLabel="System architecture explorer" tone="band">
      <Container>
        <SectionHeader
          eyebrow="System Design"
          title="Architecture, explorable"
          description="Electron's three-process model used as a security architecture, not just a runtime. Select any component — the panel explains what it does, why it exists, and what it talks to. Generated from the actual codebase."
          className="mb-10"
        />

        <Reveal>
          <div
            role="group"
            aria-label="System architecture diagram — select a component for details"
            className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-bg-deeper p-4 sm:p-6"
          >
            {LAYER_ORDER.map((layer, layerIndex) => {
              const meta = ARCH_LAYERS[layer];
              const nodes = ARCH_NODES.filter((n) => n.layer === layer);
              return (
                <div key={layer}>
                  {layerIndex > 0 ? (
                    <div aria-hidden className="mb-3 flex justify-center gap-10">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="animate-flow-pulse text-lg leading-none text-line-strong"
                          style={{ animationDelay: `${i * 0.4}s` }}
                        >
                          ↕
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className={cn("rounded-xl border p-3 sm:p-4", LAYER_TONE[layer])}>
                    <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <DiagramLabel>{meta.title}</DiagramLabel>
                      <span className="font-mono text-[10.5px] text-fg-faint">{meta.caption}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {nodes.map((node) => (
                        <NodeButton
                          key={node.id}
                          node={node}
                          isSelected={node.id === selected.id}
                          isRelated={related.has(node.id)}
                          onSelect={() => setSelectedId(node.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Detail panel */}
        <div
          aria-live="polite"
          className="mt-4 rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="text-h4 font-bold tracking-[-0.01em]">{selected.name}</h3>
            <span className="font-mono text-xs text-fg-faint">{selected.tech}</span>
          </div>

          <div className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-2">
            <div>
              <DiagramLabel className="mb-2">Responsibility</DiagramLabel>
              <p className="text-body-sm leading-[1.65] text-fg-muted">{selected.responsibility}</p>
              <DiagramLabel className="mb-2 mt-5">Why it exists</DiagramLabel>
              <p className="text-body-sm leading-[1.65] text-fg-muted">{selected.why}</p>
            </div>
            <div>
              <DiagramLabel className="mb-2">In the code</DiagramLabel>
              <p className="text-body-sm leading-[1.65] text-fg-muted">{selected.detail}</p>
              {selected.dependsOn.length > 0 || dependents.length > 0 ? (
                <>
                  <DiagramLabel className="mb-2 mt-5">Talks to</DiagramLabel>
                  <div className="flex flex-wrap gap-2">
                    {[...selected.dependsOn, ...dependents.map((d) => d.id)].map((id) => {
                      const target = ARCH_NODES.find((n) => n.id === id);
                      if (!target) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedId(id)}
                          className="rounded-md border border-white/10 bg-surface-raised px-2.5 py-1 font-mono text-[11.5px] text-fg-subtle transition-colors hover:border-brand/40 hover:text-brand-soft"
                        >
                          {target.name} →
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function NodeButton({
  node,
  isSelected,
  isRelated,
  onSelect,
}: {
  node: ArchNode;
  isSelected: boolean;
  isRelated: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      title={node.responsibility}
      className={cn(
        "group relative rounded-[10px] border px-3 py-2.5 text-left transition-all",
        isSelected
          ? "border-brand/60 bg-brand/[0.12] shadow-glow-brand"
          : isRelated
            ? "border-brand/[0.28] bg-surface-raised"
            : "border-white/[0.09] bg-surface-raised hover:border-white/25",
      )}
    >
      <span
        className={cn(
          "block text-[12.5px] font-semibold leading-tight",
          isSelected ? "text-white" : "text-fg-strong",
        )}
      >
        {node.name}
      </span>
      <span className="mt-0.5 block font-mono text-[10.5px] text-fg-faint">{node.tech}</span>
    </button>
  );
}
