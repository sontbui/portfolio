import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/motion/reveal";
import { Draw } from "@/components/motion/draw";
import { DiagramLabel } from "@/components/diagrams/primitives";
import { BEACON_TIMELINE } from "@/constants/beacon";

/**
 * Engineering journey — a phase timeline, deliberately not a date timeline:
 * each stage carries the decision made, alternatives weighed, and (where it
 * exists) the honest "what I'd change today". The maturity is in the trade-off
 * commentary, not the chronology.
 *
 * Motion: the spine draws downward as the section enters view while phases
 * cascade in, so the journey visibly builds in order. Gated on reduced motion.
 */
export function EngineeringTimeline() {
  return (
    <Section id="journey" ariaLabel="Engineering journey">
      <Container>
        <SectionHeader
          eyebrow="Engineering Journey"
          title="How Beacon evolved"
          description="Not a changelog — the decisions. Each phase records why the call was made, what was considered instead, and what I'd do differently today."
          className="mb-12"
        />
        <ol className="relative flex flex-col gap-2">
          <Draw
            axis="y"
            className="absolute bottom-6 left-[7px] top-6 w-px bg-line md:left-[9px]"
          />
          {BEACON_TIMELINE.map((stage, i) => (
            <li key={stage.phase} className="relative pl-9 md:pl-12">
              <span
                aria-hidden
                className="absolute left-0 top-[30px] inline-flex size-[15px] items-center justify-center rounded-full border border-brand/50 bg-bg md:size-[19px]"
              >
                <span className="size-[5px] rounded-full bg-brand" />
              </span>
              <Reveal delay={Math.min(i * 0.04, 0.2)}>
                <div className="rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-7">
                  <DiagramLabel className="mb-2">{stage.phase}</DiagramLabel>
                  <h3 className="text-h4 font-bold tracking-[-0.01em]">{stage.title}</h3>
                  <p className="mt-2.5 max-w-[720px] text-body-sm leading-[1.7] text-fg-muted">
                    {stage.body}
                  </p>
                  <div className="mt-4 rounded-xl border border-brand/[0.18] bg-brand/[0.05] p-4">
                    <p className="text-[13px] leading-[1.6] text-fg-subtle">
                      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-soft">
                        Decision ·{" "}
                      </span>
                      {stage.decision}
                    </p>
                  </div>
                  {stage.wouldChange ? (
                    <p className="mt-3.5 border-l-2 border-accent/50 pl-3.5 text-[13px] italic leading-[1.6] text-fg-subtle">
                      <span className="font-mono text-[10.5px] font-semibold not-italic uppercase tracking-[0.12em] text-accent-soft">
                        What I&apos;d change today ·{" "}
                      </span>
                      {stage.wouldChange}
                    </p>
                  ) : null}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
