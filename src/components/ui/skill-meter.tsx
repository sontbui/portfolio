"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
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
 * into view — here the animation *is* the data, reading the proficiency out
 * as a fill. No-ops to static segments under reduced motion.
 */
export function SkillMeter({ skill }: SkillMeterProps) {
  const { name, level, strength } = skill;
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <div className="mb-[7px] flex items-center justify-between">
        <span className="text-sm text-fg-strong">{name}</span>
        <span className="font-mono text-[11px] text-fg-ghost">{level}</span>
      </div>
      <div
        className="flex gap-[5px]"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={TOTAL_SEGMENTS}
        aria-valuenow={strength}
        aria-label={`${name}: ${level} (${strength} of ${TOTAL_SEGMENTS})`}
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
                  <span className={cn("absolute inset-0 bg-brand")} />
                ) : (
                  <motion.span
                    className="absolute inset-0 origin-left bg-brand"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={viewportOnce}
                    transition={{ duration: DUR.base, ease: EASE_STANDARD, delay: i * 0.08 }}
                  />
                ))}
            </span>
          );
        })}
      </div>
    </div>
  );
}
