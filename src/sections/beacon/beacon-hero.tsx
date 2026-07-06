import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { BeaconMark } from "@/sections/beacon/beacon-mark";
import { BEACON, BEACON_PROBLEM } from "@/constants/beacon";

const META = [
  { label: "Type", value: "Desktop platform" },
  { label: "Role", value: "Sole engineer — product, architecture, delivery" },
  { label: "Status", value: "In daily use · macOS & Windows" },
  { label: "Stack", value: "Electron · Vanilla JS · MongoDB · Claude CLI" },
] as const;

/**
 * Case-study hero. Mirrors the homepage hero's grid-backdrop signature so the
 * route reads as part of the same site, but leads with the product mark and a
 * flat meta strip — the case-study register, not the landing-page one.
 */
export function BeaconHero() {
  return (
    <section id="overview" className="bg-grid relative scroll-mt-[var(--header-h)] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_70%)] blur-2xl"
      />
      <Container className="relative py-[clamp(72px,10vw,130px)]">
        <Reveal>
          <Eyebrow tone="brand" className="mb-5">
            {BEACON.eyebrow}
          </Eyebrow>
          <h1 className="flex flex-wrap items-center gap-4">
            <BeaconMark size={52} className="text-fg-strong" />
            <TextReveal
              className="text-display font-bold leading-[1.02] tracking-[-0.035em]"
              delay={0.05}
            >
              {BEACON.title}
            </TextReveal>
          </h1>
          <p className="mt-3 font-mono text-[15px] text-brand-soft">{BEACON.tagline}</p>
          <p className="mt-6 max-w-[var(--prose-max)] text-lead leading-[1.65] text-fg-subtle">
            {BEACON.summary}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-9 flex flex-wrap gap-3">
            <Magnetic>
              <ButtonLink href="#demo">Try the interactive demo</ButtonLink>
            </Magnetic>
            <ButtonLink href="#architecture" variant="secondary">
              Explore the architecture
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/[0.07] pt-7 md:grid-cols-4">
            {META.map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-ghost">
                  {item.label}
                </dt>
                <dd className="mt-1.5 text-body-sm leading-snug text-fg-strong">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}

/** Problem / Insight / Business-context triptych directly under the hero. */
export function BeaconProblem() {
  const blocks = [BEACON_PROBLEM.problem, BEACON_PROBLEM.insight, BEACON_PROBLEM.context];
  return (
    <section
      id="problem"
      aria-label="Problem and context"
      className="scroll-mt-[var(--header-h)] border-t border-white/[0.06]"
    >
      <Container className="py-[clamp(56px,7vw,88px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-5">
          {blocks.map((block, i) => (
            <Reveal key={block.label} delay={i * 0.08}>
              <div className="h-full rounded-[14px] border border-white/[0.08] bg-surface p-6 sm:p-7">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-ghost">
                  {block.label}
                </p>
                <p className="text-[15px] leading-[1.7] text-fg-muted">{block.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
