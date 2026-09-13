import { cn } from "cn";
import type { IJob } from "@/api/jobs";
import { UPCOMING_SOON_DAYS } from "@/components/dashboard/dashboard.helpers.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { daysUntil, URGENT_DAYS_THRESHOLD } from "@/lib/status-styles.ts";
import type { UpcomingItem, UpcomingUrgency } from "@/types/dashboard";

const URGENCY_CLASS: Record<UpcomingItem["urgency"], string> = {
  urgent: "text-rose-500 dark:text-rose-400",
  soon: "text-amber-500 dark:text-amber-400",
  later: "text-muted-foreground",
};

const urgencyFor = (days: number): UpcomingUrgency => {
  if (days <= URGENT_DAYS_THRESHOLD) {
    return "urgent";
  }
  if (days <= UPCOMING_SOON_DAYS) {
    return "soon";
  }
  return "later";
};

export const buildUpcoming = (jobs: IJob[]): UpcomingItem[] => {
  const items: UpcomingItem[] = [];
  for (const job of jobs) {
    const interviewDays = daysUntil(job.interviewDate);
    if (interviewDays !== null && interviewDays >= 0) {
      items.push({
        id: `${job.id}-interview`,
        label: `Interview · ${job.title}`,
        daysAway: interviewDays,
        urgency: urgencyFor(interviewDays),
      });
    }

    const deadlineDays = daysUntil(job.deadline);
    if (deadlineDays !== null && deadlineDays >= 0) {
      items.push({
        id: `${job.id}-deadline`,
        label: `Deadline · ${job.title}`,
        daysAway: deadlineDays,
        urgency: urgencyFor(deadlineDays),
      });
    }
  }
  return items.sort((a, b) => a.daysAway - b.daysAway);
};

export const UpcomingList = ({ jobs }: Readonly<{ jobs: IJob[] }>) => {
  const upcomingItems = buildUpcoming(jobs);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-md">Upcoming</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing upcoming.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {upcomingItems.map((item) => (
              <div className="flex items-center justify-between" key={item.id}>
                <span className="min-w-0 truncate text-md">{item.label}</span>
                <span
                  className={cn(
                    "ml-3 shrink-0 font-mono text-xs",
                    URGENCY_CLASS[item.urgency]
                  )}
                >
                  {item.daysAway}d
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
