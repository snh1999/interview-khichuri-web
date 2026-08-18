import { useJob } from "@/api/jobs";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { MarkdownContent } from "@/components/common/MarkdownContent.tsx";
import { JobInfoSection } from "@/components/jobs/JobInfoSection.tsx";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobId } from "@/hooks/useId.ts";

const STATUS_COLORS: Record<string, string> = {
  saved: "bg-secondary text-secondary-foreground",
  applied: "bg-primary text-primary-foreground",
  scheduled: "bg-accent text-accent-foreground",
};

export const JobDetailPage = () => (
  <AppErrorSuspense errorPage fallback={JobDetailSkeleton}>
    <JobDetailContent />
  </AppErrorSuspense>
);

const JobDetailContent = () => {
  const jobId = useJobId();
  const { data: job } = useJob(jobId);

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-semibold text-xl">
          {job.companyName} - {job.title}
        </h1>
        <Badge
          className={
            STATUS_COLORS[job.status] ??
            "bg-secondary text-secondary-foreground"
          }
        >
          {job.status}
        </Badge>
      </div>

      <div className="flex flex-col gap-6">
        <JobInfoSection job={job} sectionId="details" />

        <Card className="px-1">
          <CardHeader className="border-b">
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MarkdownContent content={job.description} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const JobDetailSkeleton = () => (
  <div className="w-full">
    <Skeleton className="mb-4 h-8 w-64" />
    <Skeleton className="mb-6 h-5 w-96" />
    <SkeletonCard>
      <Skeleton className="h-48 w-full" />
    </SkeletonCard>
  </div>
);
