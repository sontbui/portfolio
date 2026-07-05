/**
 * Domain types for the portfolio content model.
 * Content lives in `src/constants/*`; components consume these types only,
 * so data and presentation stay decoupled.
 */

export type SkillLevel = "Advanced" | "Proficient" | "Growing";

export interface Skill {
  readonly name: string;
  readonly level: SkillLevel;
  /** Number of filled dots (0–4) used by the SkillMeter component. */
  readonly strength: 0 | 1 | 2 | 3 | 4;
}

export interface SkillGroup {
  readonly title: string;
  readonly items: readonly Skill[];
}

export interface NavLink {
  readonly href: `#${string}`;
  readonly label: string;
  /** Rendered as a CTA button rather than a plain link. */
  readonly cta?: boolean;
}

export interface PipelineStep {
  readonly n: string;
  readonly label: string;
}

export interface Agent {
  readonly tag: string;
  readonly name: string;
  readonly role: string;
}

export interface SequenceStep {
  readonly n: string;
  readonly title: string;
  readonly actor: string;
  readonly detail: string;
}

export interface Decision {
  readonly title: string;
  readonly body: string;
}

export interface Metric {
  readonly value: string;
  readonly label: string;
}

export interface FrameworkLayer {
  readonly name: string;
  readonly tag: string;
  readonly items: string;
}

export interface CiStage {
  readonly label: string;
  /** Whether an arrow trails this stage (false = terminal node). */
  readonly arrow: boolean;
}

export interface ExperienceRole {
  readonly role: string;
  readonly company: string;
  readonly industry: string;
  readonly period: string;
  readonly points: readonly string[];
  readonly tech: readonly string[];
}

export interface Principle {
  readonly title: string;
  readonly body: string;
}
