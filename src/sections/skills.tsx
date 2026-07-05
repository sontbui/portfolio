import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { SkillMeter } from "@/components/ui/skill-meter";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { SKILL_GROUPS } from "@/constants/data";

/**
 * Technical skills, grouped and rendered as strength meters. The grid auto-fits
 * columns (min 250px) so it adapts from four columns on desktop down to one on
 * mobile without hard breakpoints.
 */
export function Skills() {
  return (
    <Section id="skills" ariaLabel="Technical skills" tone="divide-top">
      <Container>
        <SectionHeader
          eyebrow="Technical Skills"
          title="The toolkit"
          tone="brand"
          className="mb-11"
        />

        <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-[18px]">
          {SKILL_GROUPS.map((group) => (
            <Reveal key={group.title} as="div" item>
              <Card surface="raised" padding="md" className="h-full rounded-xl">
                <h3 className="mb-5 text-base font-semibold">{group.title}</h3>
                <div className="flex flex-col gap-3.5">
                  {group.items.map((item) => (
                    <SkillMeter key={item.name} skill={item} />
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
