import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/motion/reveal";
import { BEACON_REFLECTION } from "@/constants/beacon";

/**
 * "Why I built this" — a personal engineering reflection in Q&A form.
 * Deliberately unglossy: it includes the uncomfortable question (an SDET
 * shipping without tests) because how an engineer talks about their gaps
 * is a stronger signal than how they talk about their wins.
 */
export function BeaconReflection() {
  return (
    <Section id="reflection" ariaLabel="Why I built this">
      <Container size="prose">
        <SectionHeader
          eyebrow="Why I Built This"
          title="An honest reflection"
          description="Not marketing copy — the questions an engineering manager would actually ask, answered the way I'd answer them in the room."
          className="mb-12"
        />
        <div className="flex flex-col gap-10">
          {BEACON_REFLECTION.map((entry, i) => (
            <Reveal key={entry.q} delay={Math.min(i * 0.03, 0.15)}>
              <h3 className="text-[17px] font-bold tracking-[-0.01em] text-white">{entry.q}</h3>
              <p className="mt-3 border-l-2 border-white/[0.12] pl-5 text-body leading-[1.75] text-fg-muted">
                {entry.a}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
