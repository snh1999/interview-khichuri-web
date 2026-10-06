import type {
  TResumeFormData,
  TSkillGroupDto,
} from "@/components/resume/job-profile/resume.helpers.ts";
import {
  DEFAULT_PDF_SETTINGS,
  type PdfSettings,
} from "@/components/resume/PDFAdapter.tsx";
import type { ISectionConfig } from "@/store/resumeStore.ts";
import {
  DEFAULT_SECTION_CONFIGS,
  useResumeStore,
} from "@/store/resumeStore.ts";
import {
  resolveTemplateEntry,
  type TTemplateKey,
} from "./template-registry.ts";

export function useTemplateSections(
  templateId: TTemplateKey
): ISectionConfig[] {
  const stored = useResumeStore((state) => state.sections[templateId]);
  const { config } = resolveTemplateEntry(templateId);
  return stored ?? config.sections ?? DEFAULT_SECTION_CONFIGS;
}

export function useTemplatePdfSettings(
  templateId: TTemplateKey,
  overrides: Partial<PdfSettings>
): PdfSettings {
  const { config } = resolveTemplateEntry(templateId);
  return { ...DEFAULT_PDF_SETTINGS, ...config.pdfSettings, ...overrides };
}

const OTHER_LABEL = /^(other|others)$/i;

export const toSkillList = (value?: string | null): string[] =>
  (value ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

export const resolveSkillGroups = (data: TResumeFormData): TSkillGroupDto[] => {
  const { skillGroups } = data;
  if (!skillGroups) {
    return [];
  }

  const filled = skillGroups.filter(
    (group) => group.keywords.trim().length > 0
  );
  const isOther = (group: TSkillGroupDto) =>
    OTHER_LABEL.test(group.label.trim());
  const [only] = filled;
  if (filled.length === 0) {
    return [];
  }
  if (filled.length === 1) {
    return [{ ...only, label: isOther(only) ? "" : only.label.trim() }];
  }
  return [...filled.filter((g) => !isOther(g)), ...filled.filter(isOther)].map(
    (group) => ({
      ...group,
      label: group.label.trim(),
    })
  );
};
