import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { DiagramFrame, DiagramLabel } from "@/components/diagrams/primitives";
import { DEPLOY_FLOW, REVIEW_FLOW, SYNC_FLOW, type FlowStep } from "@/constants/beacon";

/**
 * Three sequence/data-flow diagrams rendered in the portfolio's diagram
 * language: request flow (AI review), data flow (offline-first sync), and
 * deployment. Kept as numbered actor→action sequences — the same format the
 * AI Platform section uses — rather than decorative boxes.
 */
export function BeaconFlows() {
  return (
    <section
      id="flows"
      aria-label="Request, data, and deployment flows"
      className="scroll-mt-[var(--header-h)] border-t border-white/[0.06]"
    >
      <Container className="py-[clamp(56px,7vw,88px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
          <FlowColumn
            label="Request flow · auto AI review"
            caption="renderer → preload → main → CLI → MongoDB"
            steps={REVIEW_FLOW}
          />
          <FlowColumn
            label="Data flow · offline-first sync"
            caption="disk cache ↔ MongoDB · newer side wins"
            steps={SYNC_FLOW}
          />
          <FlowColumn
            label="Deployment · npm run dist"
            caption="syntax gate → versioned installers"
            steps={DEPLOY_FLOW}
          />
        </div>
      </Container>
    </section>
  );
}

function FlowColumn({
  label,
  caption,
  steps,
}: {
  label: string;
  caption: string;
  steps: readonly FlowStep[];
}) {
  return (
    <Reveal>
      <DiagramFrame
        label={`${label} — ${caption}`}
        className="h-full border border-white/[0.08] bg-surface p-6"
      >
        <DiagramLabel className="mb-1">{label}</DiagramLabel>
        <p className="mb-5 font-mono text-[10.5px] text-fg-faint">{caption}</p>
        <ol className="flex flex-col">
          {steps.map((step, i) => (
            <li key={step.actor + i} className="relative flex gap-3.5 pb-4 last:pb-0">
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[11px] top-6 h-[calc(100%-20px)] w-px bg-line"
                />
              ) : null}
              <span
                aria-hidden
                className="mt-0.5 inline-flex size-[23px] flex-none items-center justify-center rounded-full border border-brand/30 bg-brand/[0.08] font-mono text-[10.5px] font-semibold text-brand-soft"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-strong">
                  {step.actor}
                </span>
                <p className="mt-0.5 text-[13px] leading-[1.55] text-fg-subtle">{step.action}</p>
              </div>
            </li>
          ))}
        </ol>
      </DiagramFrame>
    </Reveal>
  );
}
