import { CapabilityBand } from "@/components/landing/CapabilityBand.tsx";
import { CtaSection } from "@/components/landing/CtaSection.tsx";
import { DecisionsSection } from "@/components/landing/DecisionsSection.tsx";
import { DeepDives } from "@/components/landing/DeepDives.tsx";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid.tsx";
import { FooterSection } from "@/components/landing/FooterSection.tsx";
import { HeroSection } from "@/components/landing/HeroSection.tsx";
import { Navbar } from "@/components/landing/Navbar.tsx";
import { RoadmapSection } from "@/components/landing/RoadmapSection.tsx";

export const LandingPage = () => (
  <div className="min-h-dvh bg-background">
    <a
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-1 focus:ring-foreground/10"
      href="#main"
    >
      Skip to content
    </a>
    <Navbar />
    <main id="main">
      <HeroSection />
      <FeaturesGrid />
      <DeepDives />
      <CapabilityBand />
      <RoadmapSection />
      <DecisionsSection />
      <CtaSection />
    </main>
    <FooterSection />
  </div>
);
