import {
  BackspaceIcon,
  FloppyDiskBackIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { FormProvider } from "react-hook-form";
import { ProfileCompletionBanner } from "@/components/job-profile/ProfileCompletionBanner.tsx";
import {
  REQUIRED_FIELDS,
  type TTabKey,
} from "@/components/job-profile/profile.data.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { getUseJobProfileForm } from "@/components/job-profile/profile.hooks.ts";
import { EducationInformation } from "@/components/job-profile/sections/education/EducationInformation.tsx";
import { WorkExperience } from "@/components/job-profile/sections/experience/WorkExperience.tsx";
import { LinksSection } from "@/components/job-profile/sections/links/LinksSection.tsx";
import { PersonalInformation } from "@/components/job-profile/sections/personal/PersonalInformation.tsx";
import { PreferencesInformation } from "@/components/job-profile/sections/preferences/PreferencesInformation.tsx";
import { ProfessionalInformation } from "@/components/job-profile/sections/professional/ProfessionalInformation.tsx";
import { ResumeCard } from "@/components/job-profile/sections/ResumeCard.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollableTabs } from "@/components/ui/shadcn-blocks/ScrollableTab.tsx";
import { useTabs } from "@/hooks/useTabs.ts";

const TABS: { key: TTabKey; label: string; requiredFieldCount: number }[] = [
  "personal",
  "professional",
  "experience",
  "education",
  "preferences",
  "links",
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

const scrollToSection = (key: TTabKey) => {
  const element = document.getElementById(getSectionId(key));
  if (!element) {
    return;
  }

  // Using viewport.scrollTo instead of element.scrollIntoView because scrollIntoView
  // finds the nearest scrollable ancestor, which can be <body> when the ScrollArea
  // viewport's height doesn't resolve as a scroll container. Scrolling <body> moves
  // the page header (which lives outside the viewport) out of view.
  const viewport = element.closest<HTMLElement>(
    '[data-slot="scroll-area-viewport"]'
  );
  if (viewport) {
    const top =
      element.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top +
      viewport.scrollTop;
    viewport.scrollTo({ top, behavior: "smooth" });
  }
};

const ProfilePage = () => {
  const { data, form, isDirty, isSaving, reset, onSubmit } =
    getUseJobProfileForm();

  const { currentTab, handleTabChange } = useTabs("personal");

  const tabs = TABS.map((tab) => {
    const filled = countFilled(data, tab.key);
    const hasMissing =
      filled < tab.requiredFieldCount && tab.requiredFieldCount > 0;
    return {
      key: tab.key,
      label: tab.label,
      indicator: hasMissing ? (
        <WarningCircleIcon className="size-3 text-destructive" weight="fill" />
      ) : null,
    };
  });

  return (
    <div className="w-full">
      <ProfileCompletionBanner data={data} />

      <ScrollableTabs
        activeTab={currentTab}
        onTabChange={(key) => {
          scrollToSection(key as TTabKey);
          handleTabChange(key);
        }}
        tabs={tabs}
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          {isDirty ? (
            <div className="fixed right-6 bottom-6 z-50 flex gap-2 rounded-lg border bg-card p-2 shadow-lg">
              <Button
                disabled={!isDirty || isSaving}
                onClick={() => reset()}
                type="button"
                variant="outline"
              >
                <BackspaceIcon />
              </Button>
              <AsyncButton isLoading={isSaving} type="submit">
                <FloppyDiskBackIcon /> Save
              </AsyncButton>
            </div>
          ) : null}
          <div className="flex flex-col gap-4 py-5">
            <ResumeCard />
            <PersonalInformation sectionId={getSectionId("personal")} />
            <ProfessionalInformation sectionId={getSectionId("professional")} />
            <WorkExperience sectionId={getSectionId("experience")} />
            <EducationInformation sectionId={getSectionId("education")} />
            <PreferencesInformation sectionId={getSectionId("preferences")} />
            <LinksSection sectionId={getSectionId("links")} />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ProfilePage;
