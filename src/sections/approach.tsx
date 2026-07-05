import { Check, Quote } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { PRINCIPLES } from "@/constants/data";

/**
 * "How I Work" — a headline claim paired with a checklist of engineering
 * principles. Two-column on wide screens, stacking below ~600px via auto-fit.
 */
export function Approach() {
  return (
    <Section id="approach" ariaLabel="How I work" tone="band-top">
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[clamp(40px,6vw,72px)]">
        <Reveal>
          <Eyebrow tone="brand" className="mb-4">
            How I Work
          </Eyebrow>
          <h2 className="mb-5 text-h3 font-bold leading-[1.12] tracking-[-0.025em] text-balance">
            Automation, treated as software engineering.
          </h2>
          <blockquote className="rounded-2xl border border-accent/20 bg-surface p-6">
            <Quote size={22} className="mb-3 text-accent/40" aria-hidden />
            <p className="text-[17px] font-medium leading-[1.55] text-fg">
              Every automation solution should reduce engineering effort in the long term — not
              simply make today&apos;s test pass.
            </p>
          </blockquote>
        </Reveal>

        <Stagger as="ul" className="flex flex-col gap-3.5" delayChildren={0.08}>
          {PRINCIPLES.map((principle) => (
            <Reveal as="li" key={principle.title} item>
              <div className="flex items-start gap-3.5 rounded-xl border border-white/[0.07] bg-surface p-5">
                <Check
                  size={17}
                  strokeWidth={2.4}
                  className="mt-0.5 flex-none text-brand"
                  aria-hidden
                />
                <div>
                  <h3 className="mb-0.5 text-[15px] font-semibold text-fg">{principle.title}</h3>
                  <p className="text-sm leading-[1.55] text-fg-subtle">{principle.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
