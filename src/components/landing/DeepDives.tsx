import { DiveSection } from "@/components/landing/DiveSection.tsx";
import { DEEP_DIVES } from "@/components/landing/landing.copy.ts";

export const DeepDives = () => (
  <>
    {DEEP_DIVES.map((dive, index) => (
      <DiveSection
        dive={dive}
        index={index}
        key={dive.number}
        last={index === DEEP_DIVES.length - 1}
      />
    ))}
  </>
);
