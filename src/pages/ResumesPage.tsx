import { FormProvider } from "react-hook-form";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { getUseJobProfileForm } from "@/components/job-profile/profile.hooks.ts";
import { PortfolioListView } from "@/components/portfolio/PortfolioListView.tsx";
import { ATSReview } from "@/components/resume/ats/ATSReview.tsx";
import { ResumeCard } from "@/components/resume/job-profile/ResumeCard.tsx";
import { ScrollableTabs } from "@/components/ui/custom/ScrollableTab.tsx";
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
  const { form } = getUseJobProfileForm();
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
            <ResumeCard />
          </FormProvider>

          <ATSReview />
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
