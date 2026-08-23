import { useMemo } from "react";
import type { TEventSource } from "@/api/calendar";
import { type IJob, useJobsAll } from "@/api/jobs";
import type { TEventVisibility, TJobEvent } from "./calendar.types";

const jobToCalendarEvent = (
  job: IJob,
  date: string,
  source: TEventSource
): TJobEvent => ({
  id: `${job.id}-${source}`,
  jobId: job.id,
  title: job.title,
  companyName: job.companyName,
  date: new Date(date),
  source,
});

export const useGetJobEvents = (visibleTypes: TEventVisibility) => {
  const { data: jobs } = useJobsAll();

  return useMemo(() => {
    if (!jobs) {
      return [];
    }
    const result: TJobEvent[] = [];
    for (const job of jobs) {
      if (visibleTypes.deadline && job.deadline) {
        result.push(jobToCalendarEvent(job, job.deadline, "deadline"));
      }
      if (visibleTypes.interview && job.interviewDate) {
        result.push(jobToCalendarEvent(job, job.interviewDate, "interview"));
      }
      if (visibleTypes.applied && job.appliedAt) {
        result.push(jobToCalendarEvent(job, job.appliedAt, "applied"));
      }
    }

    return result;
  }, [jobs, visibleTypes]);
};
