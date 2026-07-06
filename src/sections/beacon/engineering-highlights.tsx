"use client";

import { useState } from "react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/motion/reveal";
import { DiagramLabel } from "@/components/diagrams/primitives";
import { BEACON_HIGHLIGHTS } from "@/constants/beacon";
import { cn } from "@/lib/utils";

/**
 * Six implementations chosen for the judgement they demonstrate, not for
 * looking clever. Tab list on the left (accordion below md), and each
 * highlight is structured Problem → Implementation → Why → Trade-off →
 * Lesson with a short excerpt of the real code.
 */
export function EngineeringHighlights() {
  const [activeId, setActiveId] = useState(BEACON_HIGHLIGHTS[0]!.id);
  const active = BEACON_HIGHLIGHTS.find((h) => h.id === activeId) ?? BEACON_HIGHLIGHTS[0]!;

  return (
    <Section id="highlights" ariaLabel="Engineering highlights">
      <Container>
        <SectionHeader
          eyebrow="Engineering Highlights"
          title="Six decisions worth reading"
          description="Not the most complicated code in the repo — the code that shows judgement. Every excerpt is real, with the file it lives in."
          className="mb-10"
        />

        <Reveal>
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            {/* Tab list */}
            <div
              role="tablist"
              aria-label="Engineering highlights"
              aria-orientation="vertical"
              className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
            >
              {BEACON_HIGHLIGHTS.map((h) => {
                const isActive = h.id === active.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    role="tab"
                    id={`hl-tab-${h.id}`}
                    aria-selected={isActive}
                    aria-controls="hl-panel"
                    onClick={() => setActiveId(h.id)}
                    className={cn(
                      "shrink-0 rounded-xl border px-4 py-3 text-left text-[13.5px] font-medium leading-snug transition-colors lg:shrink",
                      isActive
                        ? "border-brand/50 bg-brand/[0.1] text-white"
                        : "border-white/[0.08] bg-surface text-fg-subtle hover:border-white/20 hover:text-white",
                    )}
                  >
                    {h.title}
                  </button>
                );
              })}
            </div>

            {/* Panel */}
            <div
              role="tabpanel"
              id="hl-panel"
              aria-labelledby={`hl-tab-${active.id}`}
              className="min-w-0 rounded-2xl border border-white/[0.08] bg-surface"
            >
              <div className="border-b border-white/[0.06] p-6 sm:p-7">
                <h3 className="text-h4 font-bold tracking-[-0.01em]">{active.title}</h3>
                <p className="mt-1.5 font-mono text-[11.5px] text-fg-faint">{active.file}</p>
              </div>
              <div className="grid md:grid-cols-2">
                <div className="flex flex-col gap-5 border-b border-white/[0.06] p-6 sm:p-7 md:border-b-0 md:border-r">
                  <HlBlock label="Problem" body={active.problem} />
                  <HlBlock label="Implementation" body={active.implementation} />
                  <HlBlock label="Why this approach" body={active.why} />
                </div>
                <div className="flex flex-col gap-5 p-6 sm:p-7">
                  <div>
                    <DiagramLabel className="mb-2.5">The actual code</DiagramLabel>
                    <pre className="overflow-x-auto rounded-xl border border-white/[0.07] bg-bg-deeper p-4 font-mono text-[12px] leading-[1.65] text-fg-muted">
                      <code>{active.code}</code>
                    </pre>
                  </div>
                  <HlBlock label="Trade-off" body={active.tradeoff} />
                  <HlBlock label="Lesson" body={active.lesson} accent />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function HlBlock({ label, body, accent }: { label: string; body: string; accent?: boolean }) {
  return (
    <div>
      <DiagramLabel className="mb-2">{label}</DiagramLabel>
      <p
        className={cn(
          "text-[13.5px] leading-[1.7]",
          accent ? "text-brand-soft" : "text-fg-muted",
        )}
      >
        {body}
      </p>
    </div>
  );
}
