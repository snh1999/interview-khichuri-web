import { useMemo } from "react";
import type { TEventSource } from "@/api/calendar";
import { type IJobWithTrack, useGetJobs } from "@/api/jobs";
import type { TEventVisibility, TJobEvent } from "./calendar.types.ts";

const jobToCalendarEvent = (
  job: IJobWithTrack,
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
  const { data: jobs } = useGetJobs();

  return useMemo(() => {
    if (!jobs) {
      return [];
    }
    const result: TJobEvent[] = [];
    for (const job of jobs) {
      if (visibleTypes.deadline && job.deadline) {
        result.push(jobToCalendarEvent(job, job.deadline, "deadline"));
      }
      if (visibleTypes.interview && job.track.interviewDate) {
        result.push(
          jobToCalendarEvent(job, job.track.interviewDate, "interview")
        );
      }
      if (visibleTypes.applied && job.track.appliedAt) {
        result.push(jobToCalendarEvent(job, job.track.appliedAt, "applied"));
      }
    }

    return result;
  }, [jobs, visibleTypes]);
};
