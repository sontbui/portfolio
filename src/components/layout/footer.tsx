import { Container } from "@/components/ui/container";
import { SITE } from "@/constants/site";

const YEAR = new Date().getFullYear();

/** Minimal footer — attribution and role, mirroring the design. */
export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8">
      <Container className="flex flex-wrap items-center justify-between gap-3.5">
        <span className="font-mono text-caption text-fg-ghost">
          © {YEAR} {SITE.fullName}
        </span>
        <span className="font-mono text-caption text-fg-ghost">{SITE.role}</span>
      </Container>
    </footer>
  );
}
