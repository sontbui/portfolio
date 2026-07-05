import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { PHILOSOPHY } from "@/constants/data";

/**
 * Full-bleed philosophy band. Splits the statement so the second clause is
 * de-emphasised, matching the design's two-tone treatment.
 */
export function Thesis() {
  const [lead, tail] = PHILOSOPHY.split("but by ");
  return (
    <Section id="philosophy" ariaLabel="Engineering philosophy" tone="band" space="md">
      <Container className="max-w-[1000px]">
        <Reveal>
          <Eyebrow tone="brand" className="mb-5">
            Philosophy
          </Eyebrow>
          <h2 className="text-h2 font-semibold leading-[1.25] tracking-[-0.02em] text-balance">
            {lead}
            {tail ? (
              <>
                but by <span className="text-fg-subtle">{tail}</span>
              </>
            ) : null}
          </h2>
        </Reveal>
      </Container>
    </Section>
  );
}
