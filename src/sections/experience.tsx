import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Tag } from "@/components/ui/tag";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { Draw } from "@/components/motion/draw";
import { EXPERIENCE } from "@/constants/data";
import type { ExperienceRole } from "@/types";

/**
 * Career timeline. Rendered as an ordered list on a vertical rail so the
 * chronology is conveyed semantically, not just visually.
 *
 * Motion: the rail draws downward while the roles cascade in top → bottom, so
 * the chronology visibly *builds* in order — a distinct identity from the
 * block fades used elsewhere. Gated on reduced motion.
 */
export function Experience() {
  return (
    <Section id="experience" ariaLabel="Work experience" tone="divide-top">
      <Container>
        <SectionHeader
          eyebrow="Experience"
          title="Where I've worked"
          tone="brand"
          className="mb-12"
        />

        <div className="relative pl-8">
          {/* Vertical rail (decorative) — draws in as the section enters view. */}
          <Draw
            axis="y"
            className="absolute bottom-1.5 left-[7px] top-1.5 w-px bg-gradient-to-b from-white/15 to-white/[0.02]"
          />
          <Stagger as="ol" className="flex flex-col gap-8" stagger={0.12}>
            {EXPERIENCE.map((job) => (
              <Reveal as="li" key={`${job.company}-${job.period}`} item className="relative">
                <TimelineNode />
                <RoleCard job={job} />
              </Reveal>
            ))}
          </Stagger>
        </div>
      </Container>
    </Section>
  );
}

function TimelineNode() {
  return (
    <span
      aria-hidden
      className="absolute -left-8 top-[5px] flex size-[15px] items-center justify-center rounded-full border-2 border-line-strong bg-bg"
    >
      <span className="size-[5px] rounded-full bg-brand" />
    </span>
  );
}

function RoleCard({ job }: { job: ExperienceRole }) {
  return (
    <article className="lift rounded-xl border border-white/[0.07] bg-surface-raised px-6 py-6 hover:border-white/15">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">{job.role}</h3>
        <span className="font-mono text-[12.5px] text-fg-faint">{job.period}</span>
      </div>
      <p className="mb-4 flex items-center gap-2 text-sm">
        <span className="text-body-sm text-brand">{job.company}</span>
        <span className="text-[13px] text-fg-ghost">· {job.industry}</span>
      </p>
      <ul className="mb-4 flex flex-col gap-2.5">
        {job.points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-2.5 text-body-sm leading-relaxed text-fg-subtle"
          >
            <span
              aria-hidden
              className="mt-[9px] size-1 flex-none rounded-full bg-fg-ghost"
            />
            {point}
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-1.5">
        {job.tech.map((tech) => (
          <li key={tech}>
            <Tag tone="ghost" size="sm">
              {tech}
            </Tag>
          </li>
        ))}
      </ul>
    </article>
  );
}
