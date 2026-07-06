import type { Transition, Variants } from "framer-motion";

/**
 * MOTION SYSTEM — single source of truth for the whole portfolio.
 *
 * One language, applied everywhere through the <Reveal>/<Stagger> primitives
 * and the motion helper components (CountUp, Draw, Magnetic, TextReveal). All
 * motion is gated on `prefers-reduced-motion` inside those primitives, so
 * section and diagram code never branches on the preference itself.
 *
 * Design intent: elegant over flashy, engineering over marketing. Motion
 * reinforces hierarchy and communicates information (a pipeline running, a
 * number resolving, an architecture assembling) — never decoration.
 */

type Bezier = [number, number, number, number];

/* ------------------------------------------------------------------ *
 * Easing curves
 * ------------------------------------------------------------------ */

/** Primary curve — decisive settle. Used by every scroll reveal. */
export const EASE_STANDARD: Bezier = [0.16, 1, 0.3, 1];
/** Softer landing for larger elements that assemble (diagrams, headlines). */
export const EASE_ENTRANCE: Bezier = [0.22, 1, 0.36, 1];
/** Accelerating exit. */
export const EASE_EXIT: Bezier = [0.4, 0, 1, 1];

/** Back-compat alias — existing imports keep working. */
export const EASE_OUT_SOFT: Bezier = EASE_STANDARD;

/* ------------------------------------------------------------------ *
 * Duration scale (seconds) — gives motion a hierarchy instead of one speed.
 * ------------------------------------------------------------------ */
export const DUR = {
  xfast: 0.12, // press / tap
  fast: 0.22, // hover, small toggles
  base: 0.38, // most reveals
  slow: 0.62, // diagram assembly, larger moves
  xslow: 1.1, // count-ups, line draws
} as const;

/* ------------------------------------------------------------------ *
 * Springs — physical motion for interaction (hover, press, layout).
 * ------------------------------------------------------------------ */
export const SPRING = {
  /** Crisp, low-overshoot — buttons, the nav pill, magnetic pull. */
  snappy: { type: "spring", stiffness: 420, damping: 32, mass: 0.8 },
  /** Relaxed — layout shifts and diagram nodes settling in. */
  gentle: { type: "spring", stiffness: 180, damping: 26 },
} as const satisfies Record<string, Transition>;

/* ------------------------------------------------------------------ *
 * Delay / stagger scale — cadence for orchestrated sequences.
 * ------------------------------------------------------------------ */
export const STAGGER = {
  tight: 0.04,
  base: 0.07,
  loose: 0.11,
  cascade: 0.15, // diagram nodes lighting in order
} as const;

/* ------------------------------------------------------------------ *
 * Shared transitions
 * ------------------------------------------------------------------ */
export const baseTransition: Transition = {
  duration: DUR.base,
  ease: EASE_STANDARD,
};

export const entranceTransition: Transition = {
  duration: DUR.slow,
  ease: EASE_ENTRANCE,
};

/* ------------------------------------------------------------------ *
 * Reveal variants — a small named set. Each section picks the one that
 * expresses its content, so the page is not one repeated fade-up.
 * ------------------------------------------------------------------ */

/** Default block reveal — opacity + short rise. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
};

/** Smaller rise for list items / dense grids. */
export const riseSm: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: baseTransition },
};

/** Assemble — scale-settle used for diagram nodes clicking into place. */
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: entranceTransition },
};

/** Connectors / arrows appearing between assembled nodes. */
export const connectorIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: { duration: DUR.base, ease: EASE_STANDARD } },
};

/** Parent container that staggers its children on reveal. */
export const staggerContainer = (
  stagger: number = STAGGER.base,
  delayChildren: number = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Viewport config so sections animate once when ~15% enters the viewport. */
export const viewportOnce = { once: true, amount: 0.15 } as const;

/** Slightly later trigger for elements whose payoff should land mid-screen. */
export const viewportMid = { once: true, amount: 0.35 } as const;
