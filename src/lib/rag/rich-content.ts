/**
 * Registry of rich-content identifiers the assistant can render via tools.
 * Shared by the server (tool arg schemas) and the client (renderers) so the two
 * never drift. Adding a renderer = add an id here, wire the component client-side.
 */
export const PROJECT_IDS = [
  "ai-platform",
  "automation-framework",
  "test-infrastructure",
  "ecommerce",
] as const;

export const DIAGRAM_IDS = [
  "orchestration",
  "sequence",
  "layered-architecture",
  "test-infrastructure",
  "three-tier",
] as const;

export const METRIC_SETS = ["impact", "poc"] as const;

export type ProjectId = (typeof PROJECT_IDS)[number];
export type DiagramId = (typeof DIAGRAM_IDS)[number];
export type MetricSet = (typeof METRIC_SETS)[number];
