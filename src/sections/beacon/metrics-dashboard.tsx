import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { CountUp } from "@/components/motion/count-up";
import { BEACON_METRICS, BEACON_METRICS_HONESTY } from "@/constants/beacon";

/**
 * Engineering metrics computed from the repository — each tile carries the
 * measurement note so a technical reader can verify the number, and the
 * closing line names the metric that's deliberately missing (test coverage).
 *
 * Motion: figures count up on entry so the "measured, not estimated" claim is
 * felt as the numbers resolve. Count is visual only; final values are exposed
 * to assistive tech and shown immediately under reduced motion.
 */
export function MetricsDashboard() {
  return (
    <Section id="metrics" ariaLabel="Engineering metrics" tone="band" space="md">
      <Container>
        <SectionHeader
          eyebrow="Engineering Metrics"
          title="Measured, not estimated"
          description="Computed directly from the repository — line counts via wc, handler counts via grep, module counts via ls. Hover any tile for how it was measured."
          className="mb-10"
        />
        <Stagger className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {BEACON_METRICS.map((metric) => (
            <Reveal as="div" key={metric.label} item>
              <div
                title={metric.note}
                className="group lift h-full rounded-xl border border-white/[0.08] bg-surface p-5 hover:border-brand/30 sm:p-6"
              >
                <CountUp
                  value={metric.value}
                  className="block text-[length:clamp(26px,3.4vw,36px)] font-bold leading-none tracking-[-0.03em] text-white"
                />
                <p className="mt-2 text-caption leading-[1.4] text-fg-subtle">{metric.label}</p>
                {metric.note ? (
                  <p className="mt-2.5 border-t border-white/[0.06] pt-2.5 font-mono text-[10.5px] leading-[1.5] text-fg-faint">
                    {metric.note}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </Stagger>
        <Reveal>
          <p className="mt-6 max-w-[760px] text-[13.5px] leading-[1.65] text-fg-subtle">
            {BEACON_METRICS_HONESTY}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
