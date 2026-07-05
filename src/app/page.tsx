import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/sections/hero";
import { Thesis } from "@/sections/thesis";
import { AIPlatform } from "@/sections/ai-platform/ai-platform";
import { ImpactBar } from "@/sections/impact-bar";
import { SelectedWork } from "@/sections/selected-work";
import { Experience } from "@/sections/experience";
import { Approach } from "@/sections/approach";
import { Skills } from "@/sections/skills";
import { Contact } from "@/sections/contact";

/**
 * Single-page portfolio. Each section is an independent component; the page is
 * purely a composition of them in reading order. Server-rendered by default —
 * only the nav and motion wrappers opt into the client.
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Thesis />
        <AIPlatform />
        <ImpactBar />
        <SelectedWork />
        <Experience />
        <Approach />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
