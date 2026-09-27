import { CapabilityBand } from "@/pages/landing/CapabilityBand.tsx";
import { CtaSection } from "@/pages/landing/CtaSection.tsx";
import { DecisionsSection } from "@/pages/landing/DecisionsSection.tsx";
import { DeepDives } from "@/pages/landing/DeepDives.tsx";
import { FeaturesGrid } from "@/pages/landing/FeaturesGrid.tsx";
import { FooterSection } from "@/pages/landing/FooterSection.tsx";
import { HeroSection } from "@/pages/landing/HeroSection.tsx";
import { Navbar } from "@/pages/landing/Navbar.tsx";
import { RoadmapSection } from "@/pages/landing/RoadmapSection.tsx";

export const LandingPage = () => (
  <div className="min-h-dvh bg-background">
    <Navbar />
    <main>
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
