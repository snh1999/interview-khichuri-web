import type { FC } from "react";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import type { ISectionConfig } from "@/store/resumeStore.ts";
import type { PdfSettings } from "./PDFAdapter.tsx";
import {
  DataScienceTechTemplate,
  dataScienceTemplateConfig,
} from "./templates/DataScienceTechTemplate.tsx";
import {
  JakeResumeTemplate,
  jakesTemplateConfig,
} from "./templates/JakesTemplate.tsx";
import {
  MbzuaiTemplate,
  mbzuaiTemplateConfig,
} from "./templates/MbzuaiTemplate.tsx";

export interface ResumeTemplateConfig {
  sections?: ISectionConfig[];
  pdfSettings?: Partial<PdfSettings>;
}

export interface ResumeTemplateEntry {
  component: FC<{ data: TProfileFormData; sections: ISectionConfig[] }>;
  config: ResumeTemplateConfig;
}

export const RESUME_ENTRIES = {
  mbzuai: { component: MbzuaiTemplate, config: mbzuaiTemplateConfig },
  jakes: { component: JakeResumeTemplate, config: jakesTemplateConfig },
  dataScience: {
    component: DataScienceTechTemplate,
    config: dataScienceTemplateConfig,
  },
} as const satisfies Record<string, ResumeTemplateEntry>;

export type TTemplateKey = keyof typeof RESUME_ENTRIES;

export function resolveTemplateEntry(key: string): ResumeTemplateEntry {
  return RESUME_ENTRIES[key as TTemplateKey] ?? RESUME_ENTRIES.mbzuai;
}

export const TEMPLATES: { id: TTemplateKey; label: string; source?: string }[] =
  [
    {
      id: "mbzuai",
      label: "MBZUAI",
      source:
        "https://www.overleaf.com/latex/templates/mbzuai-resume-template/xfqbdzbfdkkf",
    },
    {
      id: "jakes",
      label: "Jakes Template",
      source:
        "https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs",
    },
    {
      id: "dataScience",
      label: "Data Science Tech Template",
    },
  ];
