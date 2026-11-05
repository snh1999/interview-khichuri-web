import {
  ArrowSquareOutIcon,
  CheckIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import { generatePath, Link } from "react-router";
import { toast } from "sonner";
import { type IJob, useTrackJob } from "@/api/jobs";
import { COMPANY_DETAIL_PAGE, JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { Button } from "@/components/ui/button.tsx";
import { GutterCard } from "@/components/ui/custom/GutterCard.tsx";
import { formatDate } from "@/lib/date";
import { isHttpUrl } from "@/lib/utils";

export const JobDiscoveryCard = ({ job }: Readonly<{ job: IJob }>) => {
  const trackJob = useTrackJob();
  const companyPath = job.companyId
    ? generatePath(COMPANY_DETAIL_PAGE, { companyId: String(job.companyId) })
    : null;
  const jobPath = generatePath(JOB_DETAIL_PAGE, { jobId: job.id });

  const handleTrack = () =>
    trackJob.mutate(job.id, {
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : "Failed to track job"
        ),
      onSuccess: () => toast.success("Started to track this job"),
    });

  return (
    <GutterCard
      className="flex flex-col justify-between gap-3 pt-3"
      variant="default"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            className="text-foreground text-md line-clamp-2 leading-tight font-semibold hover:underline"
            to={jobPath}
          >
            {job.title}
          </Link>
          <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
            {companyPath ? (
              <Link className="hover:underline" to={companyPath}>
                {job.companyName}
              </Link>
            ) : (
              <span>{job.companyName}</span>
            )}
            {job.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5" />
                {job.location}
              </span>
            ) : null}
          </p>
        </div>
        <span className="text-muted-foreground shrink-0 text-xs">
          {formatDate(job.createdAt)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        {job.url && isHttpUrl(job.url) ? (
          <a
            className="text-muted-foreground inline-flex items-center gap-1 text-xs hover:underline"
            href={job.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            View posting
            <ArrowSquareOutIcon className="size-3.5" />
          </a>
        ) : (
          <span />
        )}
        <Button
          disabled={trackJob.isPending}
          onClick={handleTrack}
          size="sm"
          variant="outline"
        >
          <CheckIcon className="size-3.5" weight="bold" />
          Track
        </Button>
      </div>
    </GutterCard>
  );
};
