import { useGetJobs } from "@/api/jobs";
import { useAllInterviews } from "@/api/sessions/interviews";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import {
  avgScore,
  buildScoreHistory,
  INTERVIEWS_WEEK_DAYS,
  RECENT_ITEMS_COUNT,
  takeLatest,
} from "@/components/dashboard/dashboard.helpers";
import type { IDashboardStats } from "@/components/dashboard/dashboard.helpers.ts";
import { RecentNotesSection } from "@/components/dashboard/RecentNotesSection";
import { RecentSessionsSection } from "@/components/dashboard/RecentSessionsSection";
import { SavedJobsSection } from "@/components/dashboard/SavedJobsSection";
import { ScoreProgress } from "@/components/dashboard/ScoreProgress";
import { UpcomingList } from "@/components/dashboard/UpcomingList";
import { Skeleton } from "@/components/ui/skeleton";
import { daysUntil, isUrgent } from "@/lib/utils";

export const DashboardPage = () => (
  <AppErrorSuspense fallback={DashboardSkeleton}>
    <DashboardContent />
  </AppErrorSuspense>
);

const DashboardContent = () => {
  const { data: jobs } = useGetJobs();

  const { data: completedInterviews } = useAllInterviews({
    completed: true,
  });

  const scoreHistory = takeLatest(
    buildScoreHistory(completedInterviews),
    RECENT_ITEMS_COUNT
  );
  const avgMockScore = avgScore(buildScoreHistory(completedInterviews));

  const stats: IDashboardStats = {
    activeJobs: jobs.length,
    interviewsThisWeek: jobs.filter((job) => {
      const days = daysUntil(job.interviewDate);
      return days !== null && days >= 0 && days <= INTERVIEWS_WEEK_DAYS;
    }).length,
    avgMockScore,
    urgentDeadlines: jobs.filter((job) => isUrgent(job.deadline)).length,
  };

  return (
    <div className="space-y-6">
      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ScoreProgress points={scoreHistory} />
        <UpcomingList jobs={jobs} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentSessionsSection />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <SavedJobsSection jobs={jobs} />
          <RecentNotesSection />
        </div>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Skeleton className="h-6 w-24" />
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="h-18.5 w-full rounded-lg" key={index.toString()} />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Skeleton className="h-44 w-full rounded-lg" />
      <Skeleton className="h-44 w-full rounded-lg" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className="space-y-4 lg:col-span-5">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  </div>
);
