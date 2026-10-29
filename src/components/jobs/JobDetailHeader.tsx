import {
  BriefcaseIcon,
  BuildingsIcon,
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  LinkSimpleIcon,
  MapPinIcon,
  PencilIcon,
  PencilLineIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { IJobWithTopics } from "@/api/jobs";
import { useProfileQuery } from "@/api/profile/profiles";
import { JobDeleteButton } from "@/components/jobs/JobDeleteButton.tsx";
import { JobLetterActions } from "@/components/jobs/JobLetterActions.tsx";
import { JobPostForm } from "@/components/jobs/JobPostForm.tsx";
import {
  getDateInfo,
  JOB_STATUS_VARIANT,
  STATUS_LABEL,
} from "@/components/jobs/jobs.helpers";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { GutterCard } from "@/components/ui/custom/GutterCard.tsx";
import { StatusBadge } from "@/components/ui/custom/StatusBadge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useRolesMap, useTopicsMap } from "@/hooks/useLookupMap.ts";
import { formatDate } from "@/lib/date";
import { profileFacts } from "@/lib/deterministic-score";
import { isHttpUrl, isUrgent } from "@/lib/utils";

export const JobDetailHeader = ({ job }: { job: IJobWithTopics }) => {
  const rolesMap = useRolesMap();
  const topicsMap = useTopicsMap();
  const { data: profile } = useProfileQuery();
  const skillIds = new Set(profileFacts(profile).skillIds);
  const [dialogOpen, setDialogOpen] = useState(false);

  const roleName = rolesMap.get(job.roleId ?? 0)?.name;
  const urgent = isUrgent(job.deadline ?? null);
  const { track } = job;
  const statusVariant = track ? JOB_STATUS_VARIANT[track.status] : "default";
  const variant = urgent ? "danger" : statusVariant;

  const fmt = (d: string | null | undefined) =>
    d ? formatDate(d, "MMM d") : null;

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

  const topics = job.topicIds
    .map((id) => ({ id, name: topicsMap.get(id)?.name }))
    .filter((topic) => Boolean(topic.name));

  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  return (
    <>
      <GutterCard className="py-4" variant={variant}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-xl">{job.title}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
              <span className="inline-flex items-center gap-1">
                <BuildingsIcon className="size-3.5" />
                {job.companyName}
              </span>
              {job.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="size-3.5" />
                  {job.location}
                </span>
              ) : null}
              {roleName ? (
                <span className="inline-flex items-center gap-1">
                  <BriefcaseIcon className="size-3.5" />
                  {roleName}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {track ? (
              <StatusBadge
                label={STATUS_LABEL[track.status]}
                status={track.status}
              />
            ) : null}
            <JobLetterActions job={job} />
            <Button onClick={openDialog} size="sm" variant="outline">
              <PencilLineIcon className="size-3" />
              Edit
            </Button>
            <Separator orientation="vertical" />
            <JobDeleteButton jobId={job.id} />
          </div>
        </div>

        {topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <Badge
                key={topic.id}
                variant={
                  skillIds.size > 0 && skillIds.has(topic.id)
                    ? "secondary"
                    : "destructive"
                }
              >
                {topic.name}
              </Badge>
            ))}
          </div>
        )}

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
      </GutterCard>

      <JobPostForm
        job={job}
        onOpenChange={setDialogOpen}
        onSuccess={closeDialog}
        open={dialogOpen}
      />
    </>
  );
};
