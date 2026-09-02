import { FormProvider } from "react-hook-form";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { getUseJobProfileForm } from "@/components/job-profile/profile.hooks.ts";
import { ATSReview } from "@/components/resume/ats/ATSReview.tsx";
import { ResumeCard } from "@/components/resume/job-profile/ResumeCard.tsx";
import { Skeleton } from "@/components/ui/skeleton";

export const ResumesPage = () => (
  <AppErrorSuspense errorPage fallback={ResumePageSkeleton}>
    <ResumePageContent />
  </AppErrorSuspense>
);

const ResumePageContent = () => {
  const { form } = getUseJobProfileForm();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <FormProvider {...form}>
          <ResumeCard />
        </FormProvider>

        <ATSReview />
      </div>
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
