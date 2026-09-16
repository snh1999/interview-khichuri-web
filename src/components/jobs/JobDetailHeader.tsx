import {
  BriefcaseIcon,
  BuildingsIcon,
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  LinkSimpleIcon,
  MapPinIcon,
  PencilIcon,
  PencilLineIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { type IJobWithTopics, useDeleteJob } from "@/api/jobs";
import { useRoles, useTopics } from "@/api/lookups";
import { JOBS_PAGE } from "@/app.constants.ts";
import { JobPostForm } from "@/components/jobs/JobPostForm.tsx";
import {
  getDateInfo,
  JOB_STATUS_VARIANT,
} from "@/components/jobs/jobs.helpers.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { GutterCard } from "@/components/ui/custom/gutter-card.tsx";
import { StatusBadge } from "@/components/ui/custom/status-badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useLookupMap } from "@/hooks/useLookupMap.ts";
import { isUrgent } from "@/lib/utils";

export const JobDetailHeader = ({ job }: { job: IJobWithTopics }) => {
  const navigate = useNavigate();
  const rolesMap = useLookupMap(useRoles().data);
  const topicsMap = useLookupMap(useTopics().data);
  const [dialogOpen, setDialogOpen] = useState(false);

  const deleteJob = useDeleteJob();

  const handleDelete = async () =>
    deleteJob.mutateAsync(job.id, {
      onSuccess: () => navigate(JOBS_PAGE),
    });

  const roleName = rolesMap.get(job.roleId ?? 0)?.name;
  const urgent = isUrgent(job.deadline ?? null);
  const variant = urgent ? "danger" : JOB_STATUS_VARIANT[job.status];

  const fmt = (d: string | null | undefined) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : null;

  const dateInfo = getDateInfo(job);
  const timeline = [
    {
      label: "",
      value: dateInfo.startsWith("Create") ? null : dateInfo,
      danger: urgent,
    },
    { label: "Applied", value: fmt(job.appliedAt) },
    { label: "Interview", value: fmt(job.interviewDate) },
    { label: "Deadline", value: fmt(job.deadline) },
  ].filter((t) => t.value);

  const topicNames = job.topicIds
    .map((id) => topicsMap.get(id)?.name)
    .filter(Boolean);

  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  return (
    <>
      <GutterCard className="py-4" variant={variant}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-lg">{job.title}</p>
            <p className="m mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
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
                  <BriefcaseIcon />
                  {roleName}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={job.status} />
            <Button onClick={openDialog} size="sm" variant="outline">
              <PencilLineIcon className="size-3" />
              Edit
            </Button>
            <MutationButton
              mutationFn={handleDelete}
              requireConfirmation
              variant="destructive"
            >
              <TrashIcon />
            </MutationButton>
          </div>
        </div>

        {topicNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topicNames.map((name) => (
              <Badge key={name} variant="secondary">
                {name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-muted-foreground text-xs">
          {job.source ? (
            <span className="inline-flex items-center gap-1.5">
              <LinkSimpleIcon className="size-3.5" />
              {job.source}
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
              <PencilIcon />
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
