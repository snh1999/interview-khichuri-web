import { FloppyDiskBackIcon } from "@phosphor-icons/react";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import { ActivitiesSection } from "@/components/job-profile/sections/activities/ActivitiesSection.tsx";
import { EducationInformation } from "@/components/job-profile/sections/education/EducationInformation.tsx";
import { WorkExperience } from "@/components/job-profile/sections/experience/WorkExperience.tsx";
import { LinksSection } from "@/components/job-profile/sections/links/LinksSection.tsx";
import { PersonalInformation } from "@/components/job-profile/sections/personal/PersonalInformation.tsx";

import { ProfessionalInformation } from "@/components/job-profile/sections/professional/ProfessionalInformation.tsx";
import { ProjectsSection } from "@/components/job-profile/sections/projects/ProjectsSection.tsx";
import { PublicationsSection } from "@/components/job-profile/sections/publications/PublicationsSection.tsx";
import { ReferencesSection } from "@/components/job-profile/sections/references/ReferencesSection.tsx";
import type { TResumeFormData } from "@/components/resume/job-profile/resume.helpers.ts";
import { SectionManager } from "@/components/resume/menu/SectionManager.tsx";
import { SkillGroupsSection } from "@/components/resume/menu/SkillGroupsSection.tsx";
import type { TTemplateKey } from "@/components/resume/template-registry.ts";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollableTabs } from "@/components/ui/custom/ScrollableTab.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

const TABS = [
  { key: "sections", label: "Sections" },
  { key: "personal", label: "Personal" },
  { key: "professional", label: "Professional" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "publications", label: "Publications" },
  { key: "projects", label: "Projects" },
  { key: "references", label: "References" },
  { key: "activities", label: "Activities" },
  { key: "links", label: "Links" },
  { key: "skillGroups", label: "Skill Groups" },
] as const;

type TTabKey = (typeof TABS)[number]["key"];

const getSectionId = (key: TTabKey) => `section-${key}`;

interface ResumeFormPanelProps {
  form: UseFormReturn<TResumeFormData>;
  isDirty: boolean;
  isSaving: boolean;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  onReset: () => void;
  templateId: TTemplateKey;
}

export const ResumeFormPanel = ({
  form,
  isDirty,
  isSaving,
  onSubmit,
  onReset,
  templateId,
}: ResumeFormPanelProps) => (
  <ScrollArea className="h-full">
    <ScrollableTabs defaultTab="sections" tabs={TABS} />

    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        {isDirty ? (
          <div className="fixed right-6 bottom-6 z-50 flex gap-2 rounded-lg border bg-card p-2 shadow-lg">
            <Button
              disabled={!isDirty || isSaving}
              onClick={onReset}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <AsyncButton isLoading={isSaving} type="submit">
              <FloppyDiskBackIcon /> Save
            </AsyncButton>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 py-5">
          <SectionManager
            sectionId={getSectionId("sections")}
            templateId={templateId}
          />
          <PersonalInformation sectionId={getSectionId("personal")} />
          <ProfessionalInformation
            hideCombobox
            sectionId={getSectionId("professional")}
          />
          <WorkExperience sectionId={getSectionId("experience")} />
          <EducationInformation sectionId={getSectionId("education")} />
          <PublicationsSection sectionId={getSectionId("publications")} />
          <ProjectsSection sectionId={getSectionId("projects")} />
          <ReferencesSection sectionId={getSectionId("references")} />
          <ActivitiesSection sectionId={getSectionId("activities")} />
          <LinksSection sectionId={getSectionId("links")} />
          <SkillGroupsSection sectionId={getSectionId("skillGroups")} />
        </div>
      </form>
    </FormProvider>
  </ScrollArea>
);
