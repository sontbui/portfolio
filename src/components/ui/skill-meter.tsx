"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { DUR, EASE_STANDARD, viewportOnce } from "@/constants/motion";
import type { Skill } from "@/types";

const TOTAL_SEGMENTS = 4;

interface SkillMeterProps {
  skill: Skill;
}

/**
 * A single skill row: name, proficiency label, and a 4-segment strength meter.
 * The meter is decorative for sighted users but the strength is conveyed to
 * assistive tech via an accessible label + aria attributes on a meter role.
 *
 * Motion: the filled segments sweep in left → right when the meter scrolls
 * into view — the animation *is* the data, reading the proficiency out as a
 * fill. One viewport trigger on the row orchestrates every segment through
 * variant propagation (no per-segment observers, no stuck segments); each
 * fill's delay staggers the sweep. No-ops to static segments under reduced
 * motion.
 */
export function SkillMeter({ skill }: SkillMeterProps) {
  const { name, level, strength } = skill;
  const reduceMotion = useReducedMotion();

  const fillVariants = (i: number): Variants => ({
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: DUR.base, ease: EASE_STANDARD, delay: i * 0.08 },
    },
  });

  return (
    <div>
      <div className="mb-[7px] flex items-center justify-between gap-3">
        <span className="text-sm leading-snug text-fg-strong">{name}</span>
        <span className="whitespace-nowrap font-mono text-[11px] text-fg-ghost">{level}</span>
      </div>
      <motion.div
        className="flex gap-[5px]"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={TOTAL_SEGMENTS}
        aria-valuenow={strength}
        aria-label={`${name}: ${level} (${strength} of ${TOTAL_SEGMENTS})`}
        initial={reduceMotion ? undefined : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={viewportOnce}
      >
        {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => {
          const filled = i < strength;
          return (
            <span
              key={i}
              aria-hidden
              className="relative h-1 flex-1 overflow-hidden rounded-[2px] bg-white/10"
            >
              {filled &&
                (reduceMotion ? (
                  <span className="absolute inset-0 bg-brand" />
                ) : (
                  <motion.span
                    className="absolute inset-0 bg-brand"
                    style={{ transformOrigin: "left" }}
                    variants={fillVariants(i)}
                  />
                ))}
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}
