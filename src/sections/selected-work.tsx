import { Github } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/motion/reveal";
import { BeaconTeaser } from "@/components/work/beacon-teaser";
import { ProjectCard, ProjectDetails } from "@/components/work/project-card";
import {
  LayeredArchitectureDiagram,
  TestInfrastructureDiagram,
  ThreeTierDiagram,
} from "@/components/diagrams/work-diagrams";
import { WORK } from "@/constants/data";
import { SOCIALS } from "@/constants/site";

/**
 * Selected Work. Each project is a case study: narrative on the left, an
 * original architecture diagram on the right. The two-pane body uses an
 * auto-fit grid so it collapses to a single stacked column on small screens.
 */
export function SelectedWork() {
  return (
    <Section id="work" ariaLabel="Selected work">
      <Container>
        <SectionHeader
          eyebrow={WORK.eyebrow}
          title={WORK.title}
          description={WORK.description}
          tone="brand"
          className="mb-12 max-w-[680px]"
        />

        <div className="flex flex-col gap-7">
          <Reveal>
            <BeaconTeaser />
          </Reveal>

          <Reveal>
            <ProjectCard
              index={WORK.playwright.index}
              context={WORK.playwright.context}
              title={WORK.playwright.title}
              summary={WORK.playwright.summary}
            >
              <TwoPaneBody diagram={<LayeredArchitectureDiagram />}>
                <ProjectDetails blocks={WORK.playwright.details} />
              </TwoPaneBody>
            </ProjectCard>
          </Reveal>

          <Reveal>
            <ProjectCard
              index={WORK.infrastructure.index}
              context={WORK.infrastructure.context}
              badge={WORK.infrastructure.badge}
              title={WORK.infrastructure.title}
              summary={WORK.infrastructure.summary}
            >
              <TwoPaneBody diagram={<TestInfrastructureDiagram />}>
                <ProjectDetails blocks={WORK.infrastructure.details} />
              </TwoPaneBody>
            </ProjectCard>
          </Reveal>

          <Reveal>
            <ProjectCard
              index={WORK.ecommerce.index}
              context={WORK.ecommerce.context}
              title={WORK.ecommerce.title}
              summary={WORK.ecommerce.summary}
              action={
                <a
                  href={SOCIALS.ecommerceRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface-raised px-3.5 py-2.5 text-caption font-semibold text-white transition-colors hover:border-white/25"
                >
                  <Github size={14} aria-hidden />
                  GitHub
                </a>
              }
            >
              <div className="bg-bg-deeper p-[clamp(24px,3vw,40px)]">
                <ThreeTierDiagram note={WORK.ecommerce.note} />
              </div>
            </ProjectCard>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Case-study body: narrative pane + diagram pane. `md:grid-cols-2` splits the
 * two panes side by side on wider screens with a divider; below `md` they
 * stack and the divider becomes a horizontal rule.
 */
function TwoPaneBody({
  children,
  diagram,
}: {
  children: React.ReactNode;
  diagram: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="border-b border-white/[0.06] p-[clamp(24px,3vw,40px)] md:border-b-0 md:border-r">
        {children}
      </div>
      <div className="bg-bg-deeper p-[clamp(24px,3vw,40px)]">{diagram}</div>
    </div>
  );
}
