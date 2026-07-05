import { Download, Github, Linkedin, Mail } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { SOCIALS } from "@/constants/site";

const SOCIAL_LINKS = [
  { href: SOCIALS.github, label: SOCIALS.githubHandle, Icon: Github, external: true },
  { href: SOCIALS.linkedin, label: "LinkedIn", Icon: Linkedin, external: true },
  { href: SOCIALS.email, label: "Email", Icon: Mail, external: false },
] as const;

/**
 * Closing call-to-action. Centered layout with a masked grid backdrop echoing
 * the hero, reinforcing the visual bookend of the page.
 */
export function Contact() {
  return (
    <Section
      id="contact"
      ariaLabel="Contact"
      tone="divide-top"
      space="xl"
      className="overflow-hidden"
    >
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-90 [mask-image:radial-gradient(80%_80%_at_50%_40%,#000,transparent_75%)]"
      />
      <Reveal as="div" className="relative">
        <Container className="max-w-[760px] text-center">
        <p className="mb-5 inline-flex items-center gap-2">
          <span
            aria-hidden
            className="size-[7px] rounded-full bg-success shadow-[var(--shadow-glow-success)]"
          />
          <span className="font-mono text-xs text-fg-subtle">
            Open to Senior SDET &amp; Test Platform roles · remote
          </span>
        </p>
        <h2 className="text-h1 font-bold leading-[1.06] tracking-[-0.035em] text-balance">
          Let&apos;s build something great together.
        </h2>
        <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-[1.7] text-fg-subtle">
          Building an intelligent test platform, taming a flaky suite, or scaling automation across
          an org? I&apos;d love to hear about it.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href={SOCIALS.email} variant="primary" className="px-6 py-3.5 text-[15px]">
            <Mail size={16} aria-hidden />
            Get in touch
          </ButtonLink>
          <ButtonLink
            href={SOCIALS.resume}
            variant="secondary"
            target="_blank"
            className="px-6 py-3.5 text-[15px]"
          >
            <Download size={16} aria-hidden />
            Download Resume
          </ButtonLink>
        </div>

        <ul className="mt-11 flex flex-wrap justify-center gap-6">
          {SOCIAL_LINKS.map(({ href, label, Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 text-sm text-fg-subtle transition-colors hover:text-white"
              >
                <Icon size={17} aria-hidden />
                {label}
              </a>
            </li>
          ))}
        </ul>
        </Container>
      </Reveal>
    </Section>
  );
}
