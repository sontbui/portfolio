"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { Draw } from "@/components/motion/draw";
import { riseSm, STAGGER } from "@/constants/motion";
import type { SequenceStep } from "@/types";
import { cn } from "@/lib/utils";

/**
 * SIGNATURE INTERACTION №2 — the execution sequence is runnable.
 *
 * Instead of reading seven static stages, the visitor watches the pipeline
 * execute: statuses move queued → running → done down the spine, and the run
 * ends where the real product ends — at a PR waiting for human review. It
 * auto-runs once when scrolled into view (the section demos itself), then
 * offers Replay: the reader controls the system, which is the product's own
 * philosophy.
 *
 * Accessibility: the control is a real button; run state is announced through
 * a visually-hidden live region. Under reduced motion nothing auto-plays and
 * Run resolves the pipeline instantly — outcome without choreography.
 */

const STEP_MS = 900;

type Phase = "idle" | "running" | "done";

export function SequenceRunner({ steps }: { steps: readonly SequenceStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduceMotion = useReducedMotion();

  const total = steps.length;
  const [phase, setPhase] = useState<Phase>("idle");
  const [current, setCurrent] = useState(-1);
  const autoRanRef = useRef(false);

  // Auto-run once when the diagram is comfortably in view.
  useEffect(() => {
    if (!inView || reduceMotion || autoRanRef.current) return;
    autoRanRef.current = true;
    const id = window.setTimeout(() => {
      setPhase("running");
      setCurrent(0);
    }, 900);
    return () => window.clearTimeout(id);
  }, [inView, reduceMotion]);

  // Advance the run.
  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setTimeout(() => {
      if (current >= total - 1) {
        setPhase("done");
      } else {
        setCurrent((c) => c + 1);
      }
    }, STEP_MS);
    return () => window.clearTimeout(id);
  }, [phase, current, total]);

  const run = () => {
    autoRanRef.current = true;
    if (reduceMotion) {
      // Outcome without choreography.
      setCurrent(total - 1);
      setPhase("done");
      return;
    }
    setCurrent(0);
    setPhase("running");
  };

  const stateOf = (i: number): "queued" | "running" | "done" => {
    if (phase === "idle") return "queued";
    if (phase === "done") return "done";
    return i < current ? "done" : i === current ? "running" : "queued";
  };

  return (
    <div ref={ref}>
      {/* Control row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={phase === "running"}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 font-mono text-[12px] font-semibold transition-colors",
            phase === "running"
              ? "cursor-default border-accent/30 bg-accent/[0.08] text-accent-soft"
              : "border-white/10 bg-surface-raised text-fg-strong hover:border-accent/50 hover:text-white",
          )}
        >
          {phase === "running" ? (
            <>
              <i aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-accent" />
              running…
            </>
          ) : phase === "done" ? (
            <>
              <RotateCcw size={13} aria-hidden />
              Replay pipeline
            </>
          ) : (
            <>
              <Play size={13} aria-hidden />
              Run pipeline
            </>
          )}
        </button>
        <span aria-hidden className="font-mono text-[11px] text-fg-faint">
          {phase === "done"
            ? "✓ delivered — engineers own the merge"
            : phase === "running"
              ? `stage ${current + 1} / ${total}`
              : "7 stages · ticket → pull request"}
        </span>
        {/* Screen-reader run announcements */}
        <span className="sr-only" role="status" aria-live="polite">
          {phase === "running"
            ? `Pipeline running, stage ${current + 1} of ${total}: ${steps[current]?.title ?? ""}`
            : phase === "done"
              ? "Pipeline complete: pull request created and ready for human review."
              : ""}
        </span>
      </div>

      <div className="relative pl-[34px]">
        <Draw
          axis="y"
          delay={0.1}
          className="absolute bottom-2 left-[9px] top-2 w-px bg-gradient-to-b from-accent/50 to-accent/[0.08]"
        />
        <Stagger as="ol" stagger={STAGGER.loose} className="flex flex-col gap-4">
          {steps.map((step, i) => {
            const state = stateOf(i);
            return (
              <Reveal as="li" key={step.n} item variants={riseSm} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-[34px] top-0.5 flex size-[19px] items-center justify-center rounded-full border-2 bg-bg-deeper font-mono text-[10px] transition-colors duration-[300ms]",
                    state === "done"
                      ? "border-success/50 text-success-soft"
                      : state === "running"
                        ? "animate-pulse-dot border-accent text-white"
                        : "border-accent/50 text-accent-soft",
                  )}
                >
                  {state === "done" ? "✓" : step.n}
                </span>
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span
                    className={cn(
                      "text-[15px] font-semibold transition-colors duration-[300ms]",
                      state === "queued" && phase !== "idle" ? "text-fg-subtle" : "text-white",
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="rounded-[5px] border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-[10.5px] text-accent-soft">
                    {step.actor}
                  </span>
                  {phase !== "idle" ? (
                    <span
                      aria-hidden
                      className={cn(
                        "ml-auto font-mono text-[10.5px] transition-colors duration-[300ms]",
                        state === "done"
                          ? "text-success-soft"
                          : state === "running"
                            ? "text-accent-soft"
                            : "text-fg-faint",
                      )}
                    >
                      {state === "done" ? "✓ done" : state === "running" ? "● running" : "queued"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-caption leading-[1.55] text-fg-subtle">{step.detail}</p>
              </Reveal>
            );
          })}
        </Stagger>
      </div>
    </div>
  );
}
