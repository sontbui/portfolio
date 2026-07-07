import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Footer } from "@/components/layout/footer";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { PipelineConsole } from "@/sections/pipeline/pipeline-console";
import { PHASE_ONE_NOTE, PIPELINE_META } from "@/constants/pipeline-demo";

export const metadata: Metadata = {
  title: "AI Pipeline Console — Live Workflow Demo",
  description:
    "An orchestration-engine view of Son's real AI test-automation pipeline: n8n workflow, Claude agents, Playwright execution, self-correction, and pull-request delivery — replayed exactly as the production system runs.",
  alternates: { canonical: "/work/ai-pipeline" },
};

/**
 * Flagship route: the AI Automation Pipeline rendered as the internal
 * engineering tool it actually is. The console replays the production
 * n8n workflow (sanitized), alternating a happy-path run with a
 * self-correction run so both branches of the real system are visible.
 */
export default function AiPipelinePage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-bg/70 backdrop-blur-xl">
        <nav
          aria-label="Pipeline demo"
          className="mx-auto flex h-[var(--header-h)] max-w-[var(--container-max)] items-center gap-4 px-6 sm:px-8"
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-[7px] px-2 py-[7px] text-sm text-fg-subtle transition-colors hover:bg-surface-raised hover:text-white"
          >
            <ArrowLeft size={15} aria-hidden />
            Portfolio
          </Link>
          <span aria-hidden className="h-5 w-px bg-line" />
          <span className="font-mono text-[13px] font-semibold text-fg-strong">
            pipeline-console
          </span>
          <span className="ml-auto hidden items-center gap-1.5 font-mono text-[10.5px] text-fg-faint sm:flex">
            <i aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-success" />
            replaying production workflow
          </span>
        </nav>
      </header>

      <main id="main">
        <section className="bg-grid relative overflow-hidden">
          <Container className="relative py-[clamp(48px,6vw,80px)]">
            <Reveal>
              <Eyebrow tone="accent" className="mb-4">
                Flagship Demo · AI Automation Pipeline
              </Eyebrow>
              <h1 className="max-w-[820px]">
                <TextReveal
                  className="text-h1 font-bold leading-[1.06] tracking-[-0.03em]"
                  delay={0.05}
                >
                  Watch the platform work a ticket
                </TextReveal>
              </h1>
              <p className="mt-4 max-w-[760px] text-lead leading-[1.65] text-fg-subtle">
                This is not an animation of the AI platform — it is the platform&apos;s actual
                workflow, replayed. Every node, agent name, endpoint, state, and log format below
                mirrors the production n8n workflow and the qa-ai-service that hosts the Claude
                agents. Pause it, inspect any node, read the generated code.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-8">
                <PipelineConsole />
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
                  <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-fg-ghost">
                    {PHASE_ONE_NOTE.title}
                  </p>
                  <p className="text-[13px] leading-[1.65] text-fg-subtle">{PHASE_ONE_NOTE.body}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-surface p-5">
                  <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-fg-ghost">
                    How real is this?
                  </p>
                  <p className="text-[13px] leading-[1.65] text-fg-subtle">{PIPELINE_META.honesty}</p>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
