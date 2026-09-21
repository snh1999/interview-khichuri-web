import { cn } from "cn";
import {
  type IDashboardStats,
  type ScoreTier,
  scoreTier,
} from "@/components/dashboard/dashboard.helpers";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  colorClass?: string;
}

const SCORE_TIER_CLASS: Record<ScoreTier, string> = {
  success: "text-signal-success-foreground",
  warning: "text-signal-warning-foreground",
  danger: "text-signal-danger-foreground",
};

const StatCard = ({ label, value, colorClass }: Readonly<StatCardProps>) => (
  <Card className="gap-0.5 p-3.5">
    <p className="font-mono text-muted-foreground text-xs">{label}</p>
    <p className={cn("mt-1 font-semibold text-2xl", colorClass)}>{value}</p>
  </Card>
);

export const DashboardStats = ({
  stats,
}: Readonly<{ stats: IDashboardStats }>) => {
  const avgTier: ScoreTier | null =
    stats.avgMockScore === null ? null : scoreTier(stats.avgMockScore);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      <StatCard label="active jobs" value={String(stats.activeJobs)} />
      <StatCard
        label="interviews this week"
        value={String(stats.interviewsThisWeek)}
      />
      <StatCard
        colorClass={
          avgTier === null ? "text-muted-foreground" : SCORE_TIER_CLASS[avgTier]
        }
        label="avg mock score"
        value={avgTier === null ? "—" : `${stats.avgMockScore}%`}
      />
      <StatCard
        colorClass={
          stats.urgentDeadlines > 0
            ? "text-signal-danger-foreground"
            : undefined
        }
        label="urgent deadlines"
        value={String(stats.urgentDeadlines)}
      />
    </div>
  );
};
