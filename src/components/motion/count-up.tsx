"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

import { DUR, EASE_STANDARD } from "@/constants/motion";

/**
 * Animated number that counts up to its final value when scrolled into view.
 *
 * Purpose: make metrics read as *measured*, not decorative — the value
 * resolves rather than merely appearing. Accepts the fully-formatted display
 * string (e.g. "278+", "90%", "~20 min", "3×", "10k") and animates only the
 * numeric portion, preserving any prefix/suffix and the original formatting.
 *
 * Accessibility: the final value is always exposed to assistive tech via
 * `aria-label`; the visually-changing text is `aria-hidden`. Under reduced
 * motion (or when the number can't be parsed) it renders the final value with
 * no animation. SSR-safe: first paint renders the final string, matching the
 * server, then the client resets to the start once hydrated.
 */

interface ParsedMetric {
  prefix: string;
  suffix: string;
  num: number;
  decimals: number;
  useComma: boolean;
}

function parseMetric(raw: string): ParsedMetric | null {
  const match = raw.match(/^(\D*?)(-?\d{1,3}(?:,\d{3})+(?:\.\d+)?|-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const rawNum = match[2];
  if (rawNum === undefined) return null;
  const numStr = rawNum.replace(/,/g, "");
  const num = Number.parseFloat(numStr);
  if (!Number.isFinite(num)) return null;
  const decimalPart = numStr.split(".")[1];
  return {
    prefix: match[1] ?? "",
    suffix: match[3] ?? "",
    num,
    decimals: decimalPart ? decimalPart.length : 0,
    useComma: rawNum.includes(","),
  };
}

function format(value: number, p: ParsedMetric): string {
  const fixed = Math.abs(value).toFixed(p.decimals);
  const sign = value < 0 ? "-" : "";
  if (!p.useComma) return p.prefix + sign + fixed + p.suffix;
  const [int = "", dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return p.prefix + sign + grouped + (dec ? `.${dec}` : "") + p.suffix;
}

interface CountUpProps {
  /** The final, fully-formatted value to display and count toward. */
  value: string;
  className?: string;
  /** Count duration in seconds. */
  duration?: number;
}

export function CountUp({ value, className, duration = DUR.xslow }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const parsed = parseMetric(value);
  const [display, setDisplay] = useState(value);

  // After hydration, reset to the start so the count is visible (SSR safe).
  useEffect(() => {
    if (!parsed || reduceMotion) return;
    setDisplay(format(0, parsed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!parsed || reduceMotion || !inView) return;
    const controls = animate(0, parsed.num, {
      duration,
      ease: EASE_STANDARD,
      onUpdate: (v) => setDisplay(format(v, parsed)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion]);

  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden="true">{parsed ? display : value}</span>
    </span>
  );
}
