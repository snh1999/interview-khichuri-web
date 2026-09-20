import { useGetJobs } from "@/api/jobs";
import { useAllInterviews } from "@/api/sessions/interviews";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import {
  avgScore,
  buildScoreHistory,
  INTERVIEWS_WEEK_DAYS,
  RECENT_ITEMS_COUNT,
} from "@/components/dashboard/dashboard.helpers";
import type { DashboardStats as DashboardStatsType } from "@/components/dashboard/dashboard.helpers.ts";
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
    limit: RECENT_ITEMS_COUNT,
  });

  const scoreHistory = buildScoreHistory(completedInterviews);
  const avgMockScore = avgScore(scoreHistory);

  const stats: DashboardStatsType = {
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

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
        <ScoreProgress points={scoreHistory} />
        <UpcomingList jobs={jobs} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <RecentSessionsSection />
          <RecentNotesSection />
        </div>
        <div className="space-y-6 lg:col-span-5">
          <SavedJobsSection jobs={jobs} />
        </div>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-23 w-full rounded-lg" />
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="h-18.5 w-full rounded-lg" key={index.toString()} />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
      <Skeleton className="h-44 w-full rounded-lg" />
      <Skeleton className="h-44 w-full rounded-lg" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className="lg:col-span-5">
        <Skeleton className="h-105 w-full rounded-lg" />
      </div>
    </div>
  </div>
);
