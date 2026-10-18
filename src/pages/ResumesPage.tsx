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
  { key: "resume", label: "Resume" },
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
        <h1 className="font-semibold text-xl">Builders</h1>
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
    <Skeleton className="mb-4 h-8 w-40" />
    <Skeleton className="mb-6 h-5 w-72" />
    <SkeletonCard>
      <Skeleton className="h-40 w-full" />
    </SkeletonCard>
    <SkeletonCard>
      <Skeleton className="h-40 w-full" />
    </SkeletonCard>
  </div>
);
