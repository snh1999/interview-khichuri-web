import {
  BriefcaseIcon,
  BuildingsIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import type { IJobWithTopics } from "@/api/jobs";
import { useProfileQuery } from "@/api/profile/profiles.ts";
import { JobActionButtons } from "@/components/jobs/details/JobActionButtons.tsx";
import { JobLetterActions } from "@/components/jobs/details/JobLetterActions.tsx";
import { JobSourceAndTimeline } from "@/components/jobs/details/JobSourceAndTimeline.tsx";
import {
  JOB_STATUS_VARIANT,
  STATUS_LABEL,
} from "@/components/jobs/jobs.helpers.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { GutterCard } from "@/components/ui/custom/GutterCard.tsx";
import { StatusBadge } from "@/components/ui/custom/StatusBadge.tsx";
import { useRolesMap, useTopicsMap } from "@/hooks/useLookupMap.ts";
import { profileFacts } from "@/lib/deterministic-score.ts";
import { isUrgent } from "@/lib/utils.ts";

export const JobDetailHeader = ({ job }: { job: IJobWithTopics }) => {
  const rolesMap = useRolesMap();
  const topicsMap = useTopicsMap();
  const { data: profile } = useProfileQuery();
  const skillIds = new Set(profileFacts(profile).skillIds);

  const roleName = rolesMap.get(job.roleId ?? 0)?.name;
  const urgent = isUrgent(job.deadline ?? null);
  const { track } = job;
  const isActionable = !job.state || job.state === "ok";
  const statusVariant = track ? JOB_STATUS_VARIANT[track.status] : "default";
  const variant = urgent ? "danger" : statusVariant;

  const topics = job.topicIds
    .map((id) => ({ id, name: topicsMap.get(id)?.name }))
    .filter((topic) => Boolean(topic.name));

  return (
    <GutterCard className="py-4" variant={variant}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground text-xl font-semibold">{job.title}</p>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-foreground/90 inline-flex items-center gap-1">
              <BuildingsIcon className="size-3.5" />
              {job.companyName}
            </span>
            {job.location ? (
              <span className="text-muted-foreground/75 inline-flex items-center gap-1">
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
          {job.closedAt ? <Badge variant="outline">Closed</Badge> : null}
          {track ? (
            <StatusBadge
              label={STATUS_LABEL[track.status]}
              status={track.status}
            />
          ) : null}
          {isActionable ? <JobLetterActions job={job} /> : null}

          <JobActionButtons job={job} />
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

      <JobSourceAndTimeline job={job} urgent={urgent} />
    </GutterCard>
  );
};
