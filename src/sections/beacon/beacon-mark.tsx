import { cn } from "@/lib/utils";

/**
 * Beacon's actual product mark, taken from src/renderer/index.html in the
 * Beacon repository — a radar sweep with a signal dot. `signal` controls the
 * dot colour so the mark adapts to portfolio (brand) vs. demo (amber) accents.
 */
export function BeaconMark({
  size = 28,
  signal = "var(--color-brand)",
  className,
}: {
  size?: number;
  signal?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path
        d="M41.5 40A15.5 15.5 0 0 0 26 24.5"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M52 40A26 26 0 0 0 26 14"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".55"
      />
      <circle cx="26" cy="40" r="6.5" fill={signal} />
    </svg>
  );
}
