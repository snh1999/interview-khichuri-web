import { FormProvider } from "react-hook-form";
import { useGetResumes } from "@/api/resumes";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { getUseJobProfileForm } from "@/components/job-profile/profile.hooks.ts";
import { SaveBar } from "@/components/job-profile/SaveBar.tsx";
import { PortfolioListView } from "@/components/portfolio/PortfolioListView.tsx";
import { ATSReview } from "@/components/resume/ats/ATSReview.tsx";
import { ResumeCard } from "@/components/resume/job-profile/ResumeCard.tsx";
import { ScrollableTabs } from "@/components/ui/custom/ScrollableTab.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useTabs } from "@/hooks/useTabs.ts";

const TABS = [
  { key: "resume", label: "Resumes" },
  { key: "portfolio", label: "Portfolio" },
] as const;

export const ResumesPage = () => (
  <AppErrorSuspense errorPage fallback={ResumePageSkeleton}>
    <ResumePageContent />
  </AppErrorSuspense>
);

const ResumePageContent = () => {
  const { form, isSaving, onSubmit } = getUseJobProfileForm();
  const { data: resumes } = useGetResumes();
  const { currentTab } = useTabs("resume");

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="font-semibold text-xl">Resumes &amp; Portfolio</h1>
      </div>
      <ScrollableTabs defaultTab="resume" tabs={TABS} />
      {currentTab === "portfolio" ? (
        <div className="pt-6">
          <PortfolioListView />
        </div>
      ) : (
        <div className="flex flex-col gap-6 pt-6">
          <FormProvider {...form}>
            <form onSubmit={onSubmit}>
              <SaveBar isSaving={isSaving} />
              <ResumeCard />
            </form>
          </FormProvider>

          {resumes.length > 0 ? (
            <ATSReview />
          ) : (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>Add your first resume</EmptyTitle>
                <EmptyDescription>
                  An ATS review compares a resume with a job. Add a resume to
                  run one.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      )}
    </div>
  );
};

const ResumePageSkeleton = () => (
  <div className="w-full">
    <div className="mb-6">
      <Skeleton className="h-7 w-56" />
    </div>
    <div className="flex h-9 items-center gap-6 border-b px-4">
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-3 w-16" />
    </div>
    <div className="flex flex-col gap-6 pt-6">
      <SkeletonCard>
        <Skeleton className="h-40 w-full" />
      </SkeletonCard>
      <SkeletonCard>
        <Skeleton className="h-40 w-full" />
      </SkeletonCard>
    </div>
  </div>
);
