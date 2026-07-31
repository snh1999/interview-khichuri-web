import { FloppyDiskBackIcon } from "@phosphor-icons/react";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { EducationInformation } from "@/components/job-profile/sections/education/EducationInformation.tsx";
import { WorkExperience } from "@/components/job-profile/sections/experience/WorkExperience.tsx";
import { LinksSection } from "@/components/job-profile/sections/links/LinksSection.tsx";
import { PersonalInformation } from "@/components/job-profile/sections/personal/PersonalInformation.tsx";
import { PreferencesInformation } from "@/components/job-profile/sections/preferences/PreferencesInformation.tsx";
import { ProfessionalInformation } from "@/components/job-profile/sections/professional/ProfessionalInformation.tsx";
import { SectionManager } from "@/components/resume/temp/SectionManager.tsx";
import { SkillGroupsSection } from "@/components/resume/temp/SkillGroupsSection.tsx";
import type { TTemplateKey } from "@/components/resume/temp/template-registry.ts";
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
  { key: "preferences", label: "Preferences" },
  { key: "links", label: "Links" },
  { key: "skillGroups", label: "Skill Groups" },
] as const;

type TTabKey = (typeof TABS)[number]["key"];

const getSectionId = (key: TTabKey) => `section-${key}`;

interface ResumeFormPanelProps {
  form: UseFormReturn<TProfileFormData>;
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
              onClick={() => onReset()}
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
          <ProfessionalInformation sectionId={getSectionId("professional")} />
          <WorkExperience sectionId={getSectionId("experience")} />
          <EducationInformation sectionId={getSectionId("education")} />
          <PreferencesInformation sectionId={getSectionId("preferences")} />
          <LinksSection sectionId={getSectionId("links")} />
          <SkillGroupsSection sectionId={getSectionId("skillGroups")} />
        </div>
      </form>
    </FormProvider>
  </ScrollArea>
);
