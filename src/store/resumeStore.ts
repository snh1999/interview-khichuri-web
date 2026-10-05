import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TTemplateKey } from "@/components/resume/template-registry.ts";

export type TSectionIds =
  | "summary"
  | "education"
  | "workExperience"
  | "publications"
  | "projects"
  | "skills"
  | "references"
  | "activities";
export interface ISectionConfig {
  id: TSectionIds;
  title: string;
  enabled: boolean;
}

export const DEFAULT_SECTION_CONFIGS: ISectionConfig[] = [
  { id: "summary", title: "Personal Profile", enabled: true },
  { id: "education", title: "Education", enabled: true },
  { id: "workExperience", title: "Experience", enabled: true },
  { id: "publications", title: "Academic Publications", enabled: true },
  { id: "projects", title: "Projects/Research", enabled: true },
  { id: "skills", title: "Skills", enabled: true },
  { id: "references", title: "References", enabled: true },
  { id: "activities", title: "Activities", enabled: true },
];

interface ResumeState {
  sections: Partial<Record<TTemplateKey, ISectionConfig[]>>;
  setSections: (templateId: TTemplateKey, sections: ISectionConfig[]) => void;
  resetSections: (templateId: TTemplateKey) => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resetSections: (templateId) =>
        set((state) => {
          const next = { ...state.sections };
          delete next[templateId];
          return { sections: next };
        }),
      sections: {},

      setSections: (templateId, sections) =>
        set((state) => ({
          sections: { ...state.sections, [templateId]: sections },
        })),
    }),
    {
      name: "resume-store",
      version: 1,
      skipHydration: true,
      migrate: (persistedState, version) => {
        if (version < 1) {
          return { ...(persistedState as object), sections: {} } as ResumeState;
        }
        return persistedState as ResumeState;
      },
    }
  )
);
