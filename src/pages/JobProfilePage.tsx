import { WarningCircleIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { ProfileCompletionBanner } from "@/components/job-profile/ProfileCompletionBanner.tsx";
import {
  REQUIRED_FIELDS,
  type TTabKey,
} from "@/components/job-profile/profile.data.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { getUseJobProfileForm } from "@/components/job-profile/profile.hooks.ts";
import { SaveBar } from "@/components/job-profile/SaveBar.tsx";
import { ActivitiesSection } from "@/components/job-profile/sections/activities/ActivitiesSection.tsx";
import { EducationInformation } from "@/components/job-profile/sections/education/EducationInformation.tsx";
import { WorkExperience } from "@/components/job-profile/sections/experience/WorkExperience.tsx";
import { LinksSection } from "@/components/job-profile/sections/links/LinksSection.tsx";
import { PersonalInformation } from "@/components/job-profile/sections/personal/PersonalInformation.tsx";
import { PreferencesInformation } from "@/components/job-profile/sections/preferences/PreferencesInformation.tsx";
import { ProfessionalInformation } from "@/components/job-profile/sections/professional/ProfessionalInformation.tsx";
import { ProjectsSection } from "@/components/job-profile/sections/projects/ProjectsSection.tsx";
import { PublicationsSection } from "@/components/job-profile/sections/publications/PublicationsSection.tsx";
import { ReferencesSection } from "@/components/job-profile/sections/references/ReferencesSection.tsx";
import { ResumeCard } from "@/components/resume/job-profile/ResumeCard.tsx";
import { ScrollableTabs } from "@/components/ui/custom/ScrollableTab.tsx";

const TABS: { key: TTabKey; label: string; requiredFieldCount: number }[] = [
  "personal",
  "professional",
  "experience",
  "education",
  "preferences",
  "links",
  "publications",
  "projects",
  "references",
  "activities",
].map((key) => ({
  key: key as TTabKey,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  requiredFieldCount: REQUIRED_FIELDS.filter((field) => field.tab === key)
    .length,
}));

const getSectionId = (key: TTabKey) => `section-${key}`;

const countFilled = (data: TProfileFormData, tab: TTabKey) =>
  REQUIRED_FIELDS.filter((field) => field.tab === tab && field.isFilled(data))
    .length;

const ProfilePage = () => {
  const { form, isSaving, onSubmit } = getUseJobProfileForm();
  const liveData = form.watch() as TProfileFormData;

  const tabs = useMemo(
    () =>
      TABS.map((tab) => {
        const filled = countFilled(liveData, tab.key);
        const hasMissing =
          filled < tab.requiredFieldCount && tab.requiredFieldCount > 0;
        return {
          key: tab.key,
          label: tab.label,
          indicator: hasMissing ? (
            <WarningCircleIcon
              className="size-3 text-destructive"
              weight="fill"
            />
          ) : null,
        };
      }),
    [liveData]
  );

  return (
    <div className="w-full">
      <ProfileCompletionBanner data={liveData} />

      <ScrollableTabs defaultTab="personal" scrollTracking tabs={tabs} />

      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <SaveBar isSaving={isSaving} />
          <div className="flex flex-col gap-4 py-5">
            <ResumeCard />
            <PersonalInformation sectionId={getSectionId("personal")} />
            <ProfessionalInformation sectionId={getSectionId("professional")} />
            <WorkExperience sectionId={getSectionId("experience")} />
            <EducationInformation sectionId={getSectionId("education")} />
            <PreferencesInformation sectionId={getSectionId("preferences")} />
            <LinksSection sectionId={getSectionId("links")} />
            <PublicationsSection sectionId={getSectionId("publications")} />
            <ProjectsSection sectionId={getSectionId("projects")} />
            <ReferencesSection sectionId={getSectionId("references")} />
            <ActivitiesSection sectionId={getSectionId("activities")} />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ProfilePage;
