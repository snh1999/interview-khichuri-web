import { useGetJob } from "@/api/jobs";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { JobDetailHeader } from "@/components/jobs/JobDetailHeader.tsx";
import { JobInfoSection } from "@/components/jobs/JobInfoSection.tsx";
import { LinkedSessionsSection } from "@/components/jobs/LinkedSessionsSection.tsx";
import { ATSReview } from "@/components/resume/ats/ATSReview.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobId } from "@/hooks/useId.ts";
import { useTabs } from "@/hooks/useTabs.ts";

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

  const handleTabValueChange = (value: string | null) =>
    handleTabChange(String(value));

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <JobDetailHeader job={job} />

        <Tabs onValueChange={handleTabValueChange} value={currentTab}>
          <TabsList className="*:px-10" variant="line">
            {JOB_DETAIL_TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <JobInfoSection job={job} sectionId="details" />
          </TabsContent>

          <TabsContent value="ats">
            <ATSReview job={job} />
          </TabsContent>

          <TabsContent value="sessions">
            <LinkedSessionsSection job={job} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const JobDetailSkeleton = () => (
  <div className="w-full">
    <Skeleton className="mb-4 h-24 w-full" />
    <Skeleton className="mb-6 h-10 w-96" />
    <SkeletonCard>
      <Skeleton className="h-48 w-full" />
    </SkeletonCard>
  </div>
);
