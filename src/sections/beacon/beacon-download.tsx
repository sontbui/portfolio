import { Download } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/motion/reveal";

const BUILDS = [
  {
    platform: "macOS",
    arch: "Apple Silicon · DMG",
    version: "v278.26.710",
    size: "~100 MB",
    href: "/downloads/Beacon-278.26.710-arm64.dmg",
    note: "Unsigned internal build — on first launch run: xattr -dr com.apple.quarantine /Applications/Beacon.app",
  },
  {
    platform: "Windows",
    arch: "x64 · NSIS installer",
    version: "v278.26.707",
    size: "~83 MB",
    href: "/downloads/Beacon-Setup-278.26.707.exe",
    note: "SmartScreen may warn on unsigned installers — choose 'More info → Run anyway'.",
  },
] as const;

/**
 * Real installers, framed honestly: internal builds, unsigned, with the same
 * first-launch guidance Beacon's README ships. Requirements listed so nobody
 * downloads expecting a hosted SaaS.
 */
export function BeaconDownload() {
  return (
    <Section id="download" ariaLabel="Download Beacon" space="md">
      <Container>
        <SectionHeader
          eyebrow="Try It"
          title="Download Beacon"
          description="Actual internal builds — the same installers shipped to the team. Requirements: a MongoDB connection, a GitHub PAT, and the Claude Code CLI signed in for the AI features (Jira optional)."
          className="mb-9"
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
          {BUILDS.map((build, i) => (
            <Reveal key={build.platform} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[17px] font-bold">{build.platform}</h3>
                  <span className="font-mono text-[11px] text-fg-faint">
                    {build.version} · {build.size}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11.5px] text-fg-subtle">{build.arch}</p>
                <p className="mt-4 text-[12.5px] leading-[1.6] text-fg-subtle">{build.note}</p>
                <a
                  href={build.href}
                  download
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-body-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                >
                  <Download size={15} aria-hidden />
                  Download for {build.platform}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-5 max-w-[760px] text-[12.5px] leading-[1.6] text-fg-faint">
            Distribution note: these are internal-tool builds — the packaged database credential is
            encrypted but, as the case study's security section explains, that is obfuscation by
            design. Treat access as trusted-circle, exactly as the project&apos;s own README does.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
