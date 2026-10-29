import { useEffect } from "react";
import { useGetJob } from "@/api/jobs";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { JobDetailHeader } from "@/components/jobs/JobDetailHeader.tsx";
import { JobFitScore } from "@/components/jobs/JobFitScore.tsx";
import { JobInfoSection } from "@/components/jobs/JobInfoSection.tsx";
import { LinkedSessionsSection } from "@/components/jobs/LinkedSessionsSection.tsx";
import { ATSReview } from "@/components/resume/ats/ATSReview.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobId } from "@/hooks/useId.ts";
import { useTabs } from "@/hooks/useTabs.ts";
import { useAppStore } from "@/store/appStore.ts";

const JOB_DETAIL_TABS = [
  { key: "overview", label: "Overview" },
  { key: "ats", label: "ATS Review" },
  { key: "sessions", label: "Sessions" },
] as const;

export const JobDetailPage = () => (
  <AppErrorSuspense errorPage fallback={JobDetailSkeleton}>
    <JobDetailContent />
  </AppErrorSuspense>
);

const JobDetailContent = () => {
  const jobId = useJobId();
  const { data: job } = useGetJob(jobId);
  const { currentTab, handleTabChange } = useTabs("overview");
  const setPageHeader = useAppStore((state) => state.setPageHeader);

  useEffect(() => {
    setPageHeader(job.title);
  }, [job.title, setPageHeader]);

  const handleTabValueChange = (value: string | null) =>
    handleTabChange(String(value));

  const tabs = job.track
    ? JOB_DETAIL_TABS
    : JOB_DETAIL_TABS.filter((tab) => tab.key !== "sessions");
  const activeTab = tabs.some((tab) => tab.key === currentTab)
    ? currentTab
    : "overview";

  return (
    <div className="flex w-full flex-col gap-4">
      <JobDetailHeader job={job} />

      <Tabs onValueChange={handleTabValueChange} value={activeTab}>
        <TabsList className="w-full bg-card" variant="line">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <JobFitScore job={job} />
            <JobInfoSection job={job} sectionId="details" />
          </div>
        </TabsContent>

        <TabsContent value="ats">
          <ATSReview job={job} />
        </TabsContent>

        {job.track ? (
          <TabsContent value="sessions">
            <LinkedSessionsSection job={job} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
};

const JobDetailSkeleton = () => (
  <div className="w-full">
    <Skeleton className="mb-4 h-28 w-full" />
    <Skeleton className="mb-6 h-10 w-64" />
    <div className="grid gap-4 sm:grid-cols-2">
      <SkeletonCard>
        <Skeleton className="h-48 w-full" />
      </SkeletonCard>
      <SkeletonCard>
        <Skeleton className="h-48 w-full" />
      </SkeletonCard>
    </div>
  </div>
);
