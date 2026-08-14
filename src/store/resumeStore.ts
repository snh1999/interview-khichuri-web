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

export interface ISkillGroup {
  id: string;
  label: string;
  keywords: string;
}

interface ResumeState {
  sections: Partial<Record<TTemplateKey, ISectionConfig[]>>;
  setSections: (templateId: TTemplateKey, sections: ISectionConfig[]) => void;
  resetSections: (templateId: TTemplateKey) => void;
  skillGroups: ISkillGroup[];
  setSkillGroups: (groups: ISkillGroup[]) => void;
  updateSkillGroup: (
    id: string,
    patch: Partial<Pick<ISkillGroup, "label" | "keywords">>
  ) => void;
  addSkillGroup: () => void;
  removeSkillGroup: (id: string) => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      addSkillGroup: () =>
        set((state) => ({
          skillGroups: [
            ...state.skillGroups,
            { id: crypto.randomUUID(), keywords: "", label: "New Group" },
          ],
        })),

      removeSkillGroup: (id) =>
        set((state) => ({
          skillGroups: state.skillGroups.filter((group) => group.id !== id),
        })),

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

      setSkillGroups: (groups) => set({ skillGroups: groups }),

      skillGroups: [],

      updateSkillGroup: (id, patch) =>
        set((state) => ({
          skillGroups: state.skillGroups.map((group) =>
            group.id === id ? { ...group, ...patch } : group
          ),
        })),
    }),
    {
      name: "resume-store",
      version: 1,
      migrate: (persistedState, version) => {
        if (version < 1) {
          return { ...(persistedState as object), sections: {} } as ResumeState;
        }
        return persistedState as ResumeState;
      },
    }
  )
);
