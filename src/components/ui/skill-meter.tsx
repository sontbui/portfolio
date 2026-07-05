import { cn } from "@/lib/utils";
import type { Skill } from "@/types";

const TOTAL_SEGMENTS = 4;

interface SkillMeterProps {
  skill: Skill;
}

/**
 * A single skill row: name, proficiency label, and a 4-segment strength meter.
 * The meter is decorative for sighted users but the strength is conveyed to
 * assistive tech via an accessible label + aria attributes on a meter role.
 */
export function SkillMeter({ skill }: SkillMeterProps) {
  const { name, level, strength } = skill;
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
        {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "h-1 flex-1 rounded-[2px] transition-colors",
              i < strength ? "bg-brand" : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}
