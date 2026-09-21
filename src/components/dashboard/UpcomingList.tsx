import { CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { generatePath, Link, useNavigate } from "react-router";
import type { IJob } from "@/api/jobs";
import { JOB_DETAIL_PAGE, SCHEDULE_PAGE } from "@/app.constants.ts";
import type {
  IUpcomingItem,
  UpcomingUrgency,
} from "@/components/dashboard/dashboard.helpers";
import {
  UPCOMING_MAX_ITEMS,
  urgencyFor,
} from "@/components/dashboard/dashboard.helpers.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { daysUntil } from "@/lib/utils";

const URGENCY_TEXT_CLASS: Record<UpcomingUrgency, string> = {
  urgent: "text-signal-danger-foreground",
  soon: "text-signal-warning-foreground",
  later: "text-muted-foreground",
};

const URGENCY_DOT_CLASS: Record<UpcomingUrgency, string | null> = {
  urgent: "bg-signal-danger",
  soon: "bg-signal-warning",
  later: null,
};

export const buildUpcoming = (jobs: IJob[]): IUpcomingItem[] => {
  const items: IUpcomingItem[] = [];
  for (const job of jobs) {
    const href = generatePath(JOB_DETAIL_PAGE, { jobId: job.id });
    const interviewDays = daysUntil(job.interviewDate);
    if (interviewDays !== null && interviewDays >= 0) {
      items.push({
        id: `${job.id}-interview`,
        label: `Interview | ${job.title}`,
        href,
        daysAway: interviewDays,
        urgency: urgencyFor(interviewDays),
      });
    }

    const deadlineDays = daysUntil(job.deadline);
    if (deadlineDays !== null && deadlineDays >= 0) {
      items.push({
        id: `${job.id}-deadline`,
        label: `Deadline | ${job.title}`,
        href,
        daysAway: deadlineDays,
        urgency: urgencyFor(deadlineDays),
      });
    }
  }
  return items.sort((a, b) => a.daysAway - b.daysAway);
};

const formatDaysAway = (days: number): string =>
  days === 0 ? "Today" : `${days}d`;

const UpcomingRow = ({ item }: Readonly<{ item: IUpcomingItem }>) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(item.href);

  return (
    <Item
      className="rounded-sm bg-muted/60"
      render={
        <Button className="h-auto" onClick={handleClick} variant="ghost" />
      }
    >
      <ItemContent className="min-w-0">
        <ItemTitle className="truncate text-sm">{item.label}</ItemTitle>
      </ItemContent>
      <ItemActions>
        {URGENCY_DOT_CLASS[item.urgency] ? (
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              URGENCY_DOT_CLASS[item.urgency]
            )}
          />
        ) : null}
        <span
          className={cn("font-mono text-xs", URGENCY_TEXT_CLASS[item.urgency])}
        >
          {formatDaysAway(item.daysAway)}
        </span>
        <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </ItemActions>
    </Item>
  );
};

export const UpcomingList = ({ jobs }: Readonly<{ jobs: IJob[] }>) => {
  const upcomingItems = buildUpcoming(jobs);
  const visibleItems = upcomingItems.slice(0, UPCOMING_MAX_ITEMS);
  const hiddenCount = upcomingItems.length - visibleItems.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-base">Upcoming</CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-1 flex-col",
          upcomingItems.length === 0 && "justify-center"
        )}
      >
        {upcomingItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No interviews or deadlines scheduled.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleItems.map((item) => (
              <UpcomingRow item={item} key={item.id} />
            ))}
            {hiddenCount > 0 ? (
              <Link
                className="mt-1 flex items-center gap-1 text-muted-foreground text-xs hover:text-primary"
                to={SCHEDULE_PAGE}
              >
                {hiddenCount} more in Schedule
                <CaretRightIcon className="size-3.5" />
              </Link>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
