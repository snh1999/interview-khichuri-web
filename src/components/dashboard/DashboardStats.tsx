import { cn } from "cn";
import type { DashboardStats as DashboardStatsType } from "@/components/dashboard/dashboard.helpers";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  colorClass?: string;
}

const StatCard = ({ label, value, colorClass }: Readonly<StatCardProps>) => (
  <Card className="gap-0.5 p-3.5">
    <p className="font-mono text-muted-foreground text-xs">{label}</p>
    <p className={cn("mt-1 font-semibold text-2xl", colorClass)}>{value}</p>
  </Card>
);

export const DashboardStats = ({
  stats,
}: Readonly<{ stats: DashboardStatsType }>) => (
  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
    <StatCard label="active jobs" value={String(stats.activeJobs)} />
    <StatCard
      colorClass="text-amber-500 dark:text-amber-400"
      label="interviews this wk"
      value={String(stats.interviewsThisWeek)}
    />
    <StatCard
      colorClass="text-emerald-500 dark:text-emerald-400"
      label="avg mock score"
      value={`${stats.avgMockScore}%`}
    />
    <StatCard
      colorClass="text-rose-500 dark:text-rose-400"
      label="urgent deadlines"
      value={String(stats.urgentDeadlines)}
    />
  </div>
);
