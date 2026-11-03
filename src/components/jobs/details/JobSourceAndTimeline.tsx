/** biome-ignore-all lint/performance/noJsxPropsBind: handlers need job data */
import {
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  LinkSimpleIcon,
  PencilIcon,
} from "@phosphor-icons/react";
import type { IJob } from "@/api/jobs";
import { getDateInfo } from "@/components/jobs/jobs.helpers.ts";
import { Separator } from "@/components/ui/separator.tsx";
import { formatDate } from "@/lib/date.ts";
import { isHttpUrl } from "@/lib/utils.ts";

export const JobSourceAndTimeline = ({
  job,
  urgent,
}: {
  job: IJob;
  urgent: boolean;
}) => {
  const { track } = job;
  const fmt = (d: string | null | undefined) => formatDate(d, "MMM d");
  const dateInfo = getDateInfo(job);
  const timeline = [
    {
      label: "",
      value:
        dateInfo.startsWith("Create") || dateInfo.startsWith("Applied")
          ? null
          : dateInfo,
      danger: urgent,
    },
    { label: "Interview", value: fmt(track?.interviewDate) },
    { label: "Applied", value: fmt(track?.appliedAt) },
    { label: "Deadline", value: fmt(job.deadline) },
  ].filter((t) => t.value);

  return (
    <>
      <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-muted-foreground text-xs">
        {job.url ? (
          <span className="inline-flex items-center gap-1.5">
            <LinkSimpleIcon className="size-3.5" />
            {isHttpUrl(job.url) ? (
              <a
                className="break-all hover:underline"
                href={job.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {job.url}
              </a>
            ) : (
              job.url
            )}
          </span>
        ) : (
          <div />
        )}
        <span className="inline-flex items-center gap-5">
          <span className="flex gap-1">
            <ClockCounterClockwiseIcon className="size-3.5" />
            Created {fmt(job.createdAt)}
          </span>

          <span className="flex gap-1">
            <PencilIcon className="size-3.5" />
            Updated {fmt(job.updatedAt)}
          </span>
        </span>
      </div>

      {timeline.length > 0 && (
        <>
          <Separator className="my-1.5" />
          <div className="flex">
            {timeline.map((t, i) => (
              <div className="contents" key={t.label}>
                <div
                  className={`flex w-full flex-col justify-center rounded-md py-0.5 text-center ${
                    t.danger ? "max-w-100 bg-destructive/10 py-4" : "max-w-50"
                  }`}
                >
                  <p className="text-muted-foreground text-xs">{t.label}</p>
                  <p
                    className={`mt-0.5 font-medium text-sm ${t.danger ? "text-destructive" : ""}`}
                  >
                    {t.value}
                  </p>
                </div>
                {i < timeline.length - 1 && (
                  <div className="flex items-center">
                    <CaretRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};
