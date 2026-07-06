"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { riseSm } from "@/constants/motion";
import { HERO_STEPS } from "@/constants/data";
import { cn } from "@/lib/utils";

/**
 * SIGNATURE INTERACTION №1 — the hero pipeline *executes*.
 *
 * The card is not an illustration of the AI platform; it is a scale model of
 * it. After the steps cascade in, the pipeline runs: each agent stage
 * activates in order, completes with a check, and the cycle ends with a PR
 * opened — then the system idles and quietly runs again. The visitor's very
 * first impression is a system doing work, which is the whole thesis.
 *
 * Engineering constraints: one setTimeout chain (no rAF, no interval drift),
 * paused when the card leaves the viewport or the tab hides (via useInView),
 * transform/opacity/color-only updates. Under reduced motion the pipeline
 * renders in its *delivered* state — the outcome, statically.
 */

const STEP_MS = 1150; // one stage of work
const DELIVERED_HOLD_MS = 4600; // idle at the end of a cycle
const FIRST_RUN_DELAY_MS = 1700; // let the cascade finish before the first run

type StepState = "pending" | "running" | "done";

export function HeroPipelineCard() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduceMotion = useReducedMotion();

  const total = HERO_STEPS.length;
  // -1 = idle before first run; 0..total-1 = running step; total = delivered.
  const [progress, setProgress] = useState(-1);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const delay =
      progress === -1
        ? startedRef.current
          ? 400 // restarting after a completed cycle
          : FIRST_RUN_DELAY_MS
        : progress === total
          ? DELIVERED_HOLD_MS
          : STEP_MS;
    const id = window.setTimeout(() => {
      startedRef.current = true;
      setProgress((p) => (p >= total ? 0 : p + 1));
    }, delay);
    return () => window.clearTimeout(id);
  }, [progress, inView, reduceMotion, total]);

  // Reduced motion: show the outcome, statically.
  const effective = reduceMotion ? total : progress;
  const delivered = effective >= total;

  const stateOf = (i: number): StepState =>
    i < effective ? "done" : i === effective ? "running" : "pending";

  return (
    <figure
      ref={ref}
      className="overflow-hidden rounded-2xl border border-white/[0.09] bg-bg-deeper shadow-[var(--shadow-card)]"
      aria-label="Working model of the AI automation pipeline: it repeatedly runs the six agent stages from Jira ticket to an opened pull request"
    >
      <div className="flex items-center gap-2 border-b border-white/[0.07] bg-surface px-4 py-3">
        <span aria-hidden className="size-[11px] rounded-full bg-surface-active" />
        <span aria-hidden className="size-[11px] rounded-full bg-surface-active" />
        <span aria-hidden className="size-[11px] rounded-full bg-surface-active" />
        <span className="ml-2 font-mono text-xs text-fg-faint">agent-pipeline.yaml</span>
        {/* Live status — decorative; the figure label carries the semantics. */}
        <span aria-hidden className="ml-auto flex items-center gap-1.5 font-mono text-[10.5px]">
          {delivered ? (
            <span className="text-success-soft">✓ delivered</span>
          ) : effective >= 0 ? (
            <>
              <i className="size-1.5 animate-pulse-dot rounded-full bg-success" />
              <span className="text-fg-faint">running</span>
            </>
          ) : (
            <span className="text-fg-faint">idle</span>
          )}
        </span>
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
          {HERO_STEPS.map((step, i) => {
            const state = stateOf(i);
            return (
              <Reveal as="li" key={step.n} item variants={riseSm}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-[9px] border px-3 py-2.5 transition-[border-color,background-color,opacity] duration-[300ms]",
                    state === "running"
                      ? "border-accent/60 bg-accent/[0.12]"
                      : "border-accent/20 bg-accent/[0.06]",
                    state === "pending" && startedRef.current ? "opacity-55" : "opacity-100",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "inline-flex size-6 flex-none items-center justify-center rounded-md font-mono text-[11px] font-semibold transition-colors duration-[300ms]",
                      state === "done"
                        ? "bg-success/15 text-success-soft"
                        : state === "running"
                          ? "animate-pulse-dot bg-accent/30 text-white"
                          : "bg-accent/15 text-accent-soft",
                    )}
                  >
                    {state === "done" ? "✓" : step.n}
                  </span>
                  <span className="text-caption text-fg-strong">{step.label}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "ml-auto font-mono text-[11px] transition-colors duration-[300ms]",
                      state === "running" ? "text-accent-soft" : "text-accent",
                    )}
                  >
                    {state === "running" ? "● active" : "agent"}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </Stagger>
        {/* One-line execution log — the cycle's outcome. */}
        <p
          aria-hidden
          className="mt-3 h-[18px] truncate font-mono text-[11px] text-fg-faint transition-opacity duration-[300ms]"
        >
          {delivered ? (
            <span className="text-success-soft">
              ✓ PR opened · Jira updated — awaiting human review
            </span>
          ) : effective >= 0 ? (
            <>
              <span className="text-accent-soft">agent_0{effective + 1}</span>
              {" › "}
              {HERO_STEPS[effective]?.label.toLowerCase()}…
            </>
          ) : (
            "watching board for new tickets…"
          )}
        </p>
      </div>
    </figure>
  );
}
