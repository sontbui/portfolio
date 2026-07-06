import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { CountUp } from "@/components/motion/count-up";
import { BIG_METRICS } from "@/constants/data";

/**
 * Engineering-impact metrics band. Numbers use a subtle top-to-bottom gradient
 * fill (white → muted) for emphasis, matching the design.
 *
 * Motion: each figure counts up from zero when the band enters view, so the
 * numbers read as *measured* rather than decorative. The count is visual only
 * — the final value is exposed to assistive tech and shown immediately under
 * reduced motion.
 */
export function ImpactBar() {
  return (
    <Section id="impact" ariaLabel="Engineering impact metrics" tone="band" space="sm">
      <Container>
        <Reveal>
          <Eyebrow tone="brand" className="mb-9">
            Engineering impact at OPSWAT · approximate
          </Eyebrow>
        </Reveal>

        <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-4">
          {BIG_METRICS.map((metric) => (
            <Reveal as="div" key={metric.label} item>
              <div className="lift h-full rounded-xl border border-white/[0.07] bg-surface-raised px-6 py-6 hover:border-white/15">
                <CountUp
                  value={metric.value}
                  className="block bg-gradient-to-b from-white to-fg-subtle bg-clip-text text-[length:clamp(34px,4.5vw,46px)] font-bold leading-none tracking-[-0.04em] text-transparent"
                />
                <p className="mt-2.5 text-sm leading-[1.4] text-fg-subtle">{metric.label}</p>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
