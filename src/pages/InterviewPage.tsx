import { useGetInterview } from "@/api/sessions/interviews.ts";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useInterviewId } from "@/hooks/useId.ts";
import { InterviewReport } from "../components/interview/report/InterviewReport.tsx";

export const InterviewPage = () => (
  <AppErrorSuspense errorPage fallback={InterviewSkeleton}>
    <InterviewContent />
  </AppErrorSuspense>
);

const InterviewContent = () => {
  const interviewId = useInterviewId();
  const { data: interview } = useGetInterview(interviewId);

  if (interview.completedAt) {
    return <InterviewReport interview={interview} />;
  }
  return null;
};

export const InterviewSkeleton = () => (
  <div className="-mt-6 -mr-4 -mb-6 -ml-4 flex h-[calc(100dvh-3rem)] flex-col sm:-mr-6 sm:-ml-6">
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="w-60 shrink-0 bg-muted/40 p-3">
        <div className="flex items-center gap-1">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
        </div>
        <Skeleton className="mx-auto mt-1 h-4 w-10" />
        <Skeleton className="mt-2 aspect-4/3 w-full rounded-lg" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-border border-b px-3 py-2">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="shrink-0 border-border border-t p-4">
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  </div>
);
