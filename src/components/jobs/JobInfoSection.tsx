import { PencilLineIcon } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import type { IJobWithTopics } from "@/api/jobs";
import { useRoles, useTopics } from "@/api/lookups";
import { JobPostForm } from "@/components/jobs/JobPostForm.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useLookupMap } from "@/hooks/useLookupMap.ts";

interface IProps {
  sectionId: string;
  job: IJobWithTopics;
}

const FieldLabel = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => (
  <div>
    <span className="text-muted-foreground text-xs">{title}</span>
    <p className="mt-0.5 text-sm">{children}</p>
  </div>
);

export const JobInfoSection = ({ sectionId, job }: IProps) => {
  const rolesMap = useLookupMap(useRoles().data);
  const topicsMap = useLookupMap(useTopics().data);
  const [dialogOpen, setDialogOpen] = useState(false);

  const roleName = rolesMap.get(job.roleId ?? 0)?.name;
  const formattedLinks = job.links ? job.links.split("\n").filter(Boolean) : [];

  const createdDate = new Date(job.createdAt).toLocaleDateString();
  const updatedDate = new Date(job.updatedAt).toLocaleDateString();

  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  return (
    <>
      <Card className="px-1" id={sectionId}>
        <CardHeader className="border-b">
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Created {createdDate}</CardDescription>
          <CardAction className="flex flex-col gap-1 *:w-fit">
            <Button
              className="ml-auto"
              onClick={openDialog}
              size="sm"
              variant="outline"
            >
              <PencilLineIcon className="size-3" />
              Edit
            </Button>

            <span className="text-muted-foreground text-xs">
              Updated {updatedDate}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
          <FieldLabel title="Title">{job.title}</FieldLabel>
          <FieldLabel title="Role">{roleName ?? "Not set"}</FieldLabel>
          <FieldLabel title="Company">{job.companyName}</FieldLabel>
          <FieldLabel title="Location">{job.location ?? "Not set"}</FieldLabel>
          <FieldLabel title="Source">{job.source ?? "Not set"}</FieldLabel>
          <div />

          <FieldLabel title="Deadline">
            {job.deadline
              ? new Date(job.deadline).toLocaleDateString()
              : "Not set"}
          </FieldLabel>

          <FieldLabel title="Interview Date">
            {job.interviewDate
              ? new Date(job.interviewDate).toLocaleDateString()
              : "Not set"}
          </FieldLabel>

          <div className="md:col-span-2">
            <FieldLabel title="Topics">
              {job.topicIds.length > 0
                ? job.topicIds
                    .map((id) => topicsMap.get(id)?.name)
                    .filter(Boolean)
                    .join(", ")
                : "Not set"}
            </FieldLabel>
          </div>
        </CardContent>
      </Card>

      <JobPostForm
        job={job}
        onOpenChange={setDialogOpen}
        onSuccess={closeDialog}
        open={dialogOpen}
      />

      {job.notes ? (
        <Card className="px-1">
          <CardHeader className="border-b">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="wrap-break-word whitespace-pre-wrap text-sm">
              {job.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {formattedLinks.length > 0 ? (
        <Card className="px-1">
          <CardHeader className="border-b">
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 pt-4">
            {formattedLinks.map((link) => (
              <a
                className="break-all text-blue-600 text-sm underline"
                href={link}
                key={link}
                rel="noopener noreferrer"
                target="_blank"
              >
                {link}
              </a>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
};
