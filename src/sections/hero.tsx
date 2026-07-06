import { ArrowRight, Download, MapPin } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { riseSm } from "@/constants/motion";
import { HERO_STEPS } from "@/constants/data";
import { SITE, SOCIALS } from "@/constants/site";

/**
 * Landing hero. Two-column on desktop (intro + live pipeline card), stacking to
 * a single column on narrow viewports via an auto-fit grid rather than a hard
 * breakpoint, so the layout reflows fluidly at every width.
 *
 * Motion identity: the headline wipes up from a mask, the supporting copy
 * cascades in beneath it, and the pipeline card's six agent steps draw in top
 * → bottom so the Jira → PR flow reads as a sequence that *runs*, not a static
 * list. The primary CTA is magnetic. Everything is gated on reduced motion.
 */
export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* Grid backdrop, masked toward the top-right (decorative) */}
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(120%_90%_at_72%_0%,#000_18%,transparent_72%)]"
      />
      {/* Accent glow (decorative) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-40 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.14),transparent_68%)] blur-2xl"
      />

      <Container className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-center gap-[clamp(40px,6vw,68px)] pb-[clamp(56px,8vw,96px)] pt-[clamp(64px,10vw,120px)]">
        <div>
          <Reveal>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-surface px-3 py-1.5">
              <span
                aria-hidden
                className="size-[7px] animate-[pulseDot_2.4s_ease-in-out_infinite] rounded-full bg-success shadow-[var(--shadow-glow-success)]"
              />
              <span className="font-mono text-xs text-fg-subtle">{SITE.role}</span>
            </p>
          </Reveal>

          <TextReveal
            as="h1"
            className="text-display font-bold leading-none tracking-[-0.035em]"
            delay={0.05}
          >
            {SITE.name}
          </TextReveal>

          <Reveal delay={0.14}>
            <p className="mt-5 max-w-[540px] text-h4 font-medium leading-[1.32] tracking-[-0.01em] text-balance">
              I build <span className="text-accent-soft">AI-powered automation platforms</span> —
              not just automated tests.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-5 max-w-[520px] text-body-lg leading-[1.7] text-fg-subtle">
              Software Engineer in Test focused on intelligent test platforms, framework
              architecture, and testing infrastructure that make software quality scalable across an
              engineering organization.
            </p>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <ButtonLink href="#ai-platform" variant="primary">
                  View the AI Platform
                  <ArrowRight size={15} strokeWidth={2.2} aria-hidden />
                </ButtonLink>
              </Magnetic>
              <ButtonLink href={SOCIALS.resume} variant="secondary" target="_blank">
                <Download size={15} strokeWidth={2.2} aria-hidden />
                Resume
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-8 flex flex-wrap gap-6 text-caption text-fg-faint">
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-fg-subtle" aria-hidden />
                {SITE.location}
              </span>
              <span className="flex items-center gap-2">
                <span aria-hidden className="size-[7px] rounded-full bg-success" />
                {SITE.availability}
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <HeroPipelineCard />
        </Reveal>
      </Container>
    </section>
  );
}

/** Decorative "terminal" card previewing the AI pipeline stages. */
function HeroPipelineCard() {
  return (
    <figure
      className="overflow-hidden rounded-2xl border border-white/[0.09] bg-bg-deeper shadow-[var(--shadow-card)]"
      aria-label="Preview of the AI automation pipeline: Jira ticket to pull request in six agent-driven steps"
    >
      <div className="flex items-center gap-2 border-b border-white/[0.07] bg-surface px-4 py-3">
        <span aria-hidden className="size-[11px] rounded-full bg-surface-active" />
        <span aria-hidden className="size-[11px] rounded-full bg-surface-active" />
        <span aria-hidden className="size-[11px] rounded-full bg-surface-active" />
        <span className="ml-2 font-mono text-xs text-fg-faint">agent-pipeline.yaml</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg-ghost">
            Jira Ticket
          </span>
          <span aria-hidden className="h-px flex-1 bg-white/[0.08]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg-ghost">
            Pull Request
          </span>
        </div>
        <Stagger as="ol" className="flex flex-col gap-2" stagger={0.09} delayChildren={0.35}>
          {HERO_STEPS.map((step) => (
            <Reveal as="li" key={step.n} item variants={riseSm}>
              <div className="flex items-center gap-2.5 rounded-[9px] border border-accent/20 bg-accent/[0.06] px-3 py-2.5">
                <span
                  aria-hidden
                  className="inline-flex size-6 flex-none items-center justify-center rounded-md bg-accent/15 font-mono text-[11px] font-semibold text-accent-soft"
                >
                  {step.n}
                </span>
                <span className="text-caption text-fg-strong">{step.label}</span>
                <span className="ml-auto font-mono text-[11px] text-accent">agent</span>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </div>
    </figure>
  );
}
