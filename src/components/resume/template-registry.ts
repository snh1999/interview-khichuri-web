import type { FC } from "react";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import type { ISectionConfig } from "@/store/resumeStore";
import {
  DataScienceTechTemplate,
  dataScienceTemplateConfig,
} from "./DataScienceTechTemplate.tsx";
import { JakeResumeTemplate, jakesTemplateConfig } from "./JakesTemplate.tsx";
import { MbzuaiTemplate, mbzuaiTemplateConfig } from "./MbzuaiTemplate.tsx";
import type { PdfSettings } from "./PDFAdapter.tsx";

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
