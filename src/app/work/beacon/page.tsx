import type { Metadata } from "next";

import { Footer } from "@/components/layout/footer";
import { BeaconSubnav } from "@/sections/beacon/beacon-subnav";
import { BeaconHero, BeaconProblem } from "@/sections/beacon/beacon-hero";
import { ArchitectureExplorer } from "@/sections/beacon/architecture-explorer";
import { BeaconFlows } from "@/sections/beacon/beacon-flows";
import { BeaconDemo } from "@/sections/beacon/beacon-demo";
import { EngineeringTimeline } from "@/sections/beacon/engineering-timeline";
import { MetricsDashboard } from "@/sections/beacon/metrics-dashboard";
import { EngineeringHighlights } from "@/sections/beacon/engineering-highlights";
import { BeaconReflection } from "@/sections/beacon/beacon-reflection";
import { BeaconDownload } from "@/sections/beacon/beacon-download";
import { BeaconStory } from "@/sections/beacon/beacon-story";
import { BEACON } from "@/constants/beacon";

export const metadata: Metadata = {
  title: "Beacon — Engineering Case Study",
  description: `${BEACON.tagline}. ${BEACON.summary}`,
  alternates: { canonical: "/work/beacon" },
  openGraph: {
    title: "Beacon — Engineering Case Study",
    description: BEACON.summary,
  },
};

/**
 * Immersive case-study route. Reading order is deliberate: what it is →
 * how it's built (explorable) → try it → how it evolved → the numbers →
 * the code → the person → the wider story.
 */
export default function BeaconPage() {
  return (
    <>
      <BeaconSubnav />
      <main id="main">
        <BeaconHero />
        <BeaconProblem />
        <ArchitectureExplorer />
        <BeaconFlows />
        <BeaconDemo />
        <EngineeringTimeline />
        <MetricsDashboard />
        <EngineeringHighlights />
        <BeaconReflection />
        <BeaconDownload />
        <BeaconStory />
      </main>
      <Footer />
    </>
  );
}
