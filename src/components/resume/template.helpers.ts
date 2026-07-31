import {
  DEFAULT_PDF_SETTINGS,
  type PdfSettings,
} from "@/components/resume/temp/PDFAdapter.tsx";
import type { ISectionConfig } from "@/store/resumeStore";
import { DEFAULT_SECTION_CONFIGS, useResumeStore } from "@/store/resumeStore";
import { RESUME_ENTRIES, type TTemplateKey } from "./template-registry.ts";

export function useTemplateSections(
  templateId: TTemplateKey
): ISectionConfig[] {
  const stored = useResumeStore((state) => state.sections[templateId]);
  const config = RESUME_ENTRIES[templateId].config;
  return stored ?? config.sections ?? DEFAULT_SECTION_CONFIGS;
}

export function useTemplatePdfSettings(
  templateId: TTemplateKey,
  overrides: Partial<PdfSettings>
): PdfSettings {
  const config = RESUME_ENTRIES[templateId].config;
  return { ...DEFAULT_PDF_SETTINGS, ...config.pdfSettings, ...overrides };
}
