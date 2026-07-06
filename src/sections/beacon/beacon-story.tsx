import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Tag } from "@/components/ui/tag";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { BEACON_CROSSLINKS, BEACON_STACK, BEACON_STORY } from "@/constants/beacon";

/**
 * Closing act: where Beacon sits in the wider body of work (cross-links back
 * to the homepage case studies), the full stack, and the one-paragraph thesis
 * that ties the portfolio into a single narrative.
 */
export function BeaconStory() {
  return (
    <Section id="story" ariaLabel="Where Beacon fits" tone="band">
      <Container>
        <SectionHeader
          eyebrow="One Continuous Story"
          title="Where Beacon fits"
          description={BEACON_STORY}
          className="mb-10 max-w-[760px]"
        />

        <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
          {BEACON_CROSSLINKS.map((link) => (
            <Reveal as="div" key={link.title} item>
              <Link
                href={link.href}
                className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-surface p-6 transition-colors hover:border-brand/40"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-[15px] font-semibold leading-snug text-white">
                    {link.title}
                  </span>
                  <ArrowUpRight
                    size={16}
                    aria-hidden
                    className="mt-0.5 flex-none text-fg-ghost transition-colors group-hover:text-brand-soft"
                  />
                </span>
                <span className="mt-3 text-[13px] leading-[1.65] text-fg-subtle">
                  {link.relation}
                </span>
              </Link>
            </Reveal>
          ))}
        </Stagger>

        <Reveal>
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-7">
            <Eyebrow tone="muted" className="mb-4">
              Technology Stack
            </Eyebrow>
            <ul className="flex flex-wrap gap-2">
              {BEACON_STACK.map((tech) => (
                <li key={tech}>
                  <Tag tone="ghost" size="md">
                    {tech}
                  </Tag>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
