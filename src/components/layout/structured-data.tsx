import { SITE, SOCIALS } from "@/constants/site";
import { EXPERIENCE, SKILL_GROUPS } from "@/constants/data";

/**
 * JSON-LD structured data (schema.org Person + ProfilePage) for rich results.
 * Rendered server-side into the document so crawlers see it without JS.
 */
export function StructuredData() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.fullName,
    alternateName: SITE.name,
    jobTitle: "Software Engineer in Test",
    description: SITE.description,
    url: SITE.url,
    email: SITE.email,
    image: `${SITE.url}/icon.svg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
    sameAs: [SOCIALS.github, SOCIALS.linkedin],
    worksFor: {
      "@type": "Organization",
      name: EXPERIENCE[0]?.company ?? "OPSWAT",
    },
    knowsAbout: SKILL_GROUPS.flatMap((group) => group.items.map((s) => s.name)),
  };

  const profilePage = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateModified: new Date().toISOString(),
    mainEntity: { "@type": "Person", name: SITE.fullName, url: SITE.url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Controlled, static content — safe to inline as JSON-LD.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePage) }}
      />
    </>
  );
}
