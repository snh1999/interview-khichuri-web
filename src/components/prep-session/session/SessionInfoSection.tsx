import type { ReactNode } from "react";
import { generatePath, useNavigate } from "react-router";
import { useJob } from "@/api/jobs";
import { useRoles } from "@/api/lookups";
import type { IPrepSession } from "@/api/sessions";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription } from "@/components/ui/card.tsx";
import { useLookupMap } from "@/hooks/useLookupMap.ts";

interface IProps {
  sectionId: string;
  session: IPrepSession;
}

const FieldLabel = ({
  children,
  title,
  full,
}: {
  children: ReactNode;
  title: string;
  full?: boolean;
}) => (
  <div className={full ? "md:col-span-2" : undefined}>
    <span className="text-muted-foreground text-xs">{title}</span>
    <p className="wrap-break-word mt-0.5 whitespace-pre-wrap text-sm">
      {children}
    </p>
  </div>
);

const LinkedJobField = ({ jobId }: { jobId: string }) => {
  const navigate = useNavigate();
  const handleClick = () =>
    navigate(generatePath(JOB_DETAIL_PAGE, { jobId: job.id }));
  const { data: job } = useJob(jobId);

  return (
    <FieldLabel title="Linked Job">
      <Button
        className="h-auto p-0 text-sm"
        onClick={handleClick}
        variant="link"
      >
        {job.title} @ {job.companyName}
      </Button>
    </FieldLabel>
  );
};

export const SessionInfoSection = ({ sectionId, session }: IProps) => {
  const { data: roles } = useRoles();
  const rolesMap = useLookupMap(roles);

  const roleName = rolesMap.get(session.roleId ?? 0)?.name;

  const createdDate = new Date(session.createdAt).toLocaleDateString();
  const updatedDate = new Date(session.updatedAt).toLocaleDateString();

  return (
    <Card className="mt-2 px-1" id={sectionId}>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FieldLabel full title="Title">
          {session.title}
        </FieldLabel>

        {session.jobId ? <LinkedJobField jobId={session.jobId} /> : null}

        <FieldLabel title="Experience Level">
          {session.experience ? (
            <Badge
              className="bg-secondary text-secondary-foreground"
              variant="secondary"
            >
              {session.experience}
            </Badge>
          ) : (
            "Not set"
          )}
        </FieldLabel>
        <FieldLabel title="Target Role">{roleName ?? "Not set"}</FieldLabel>

        <FieldLabel full title="Description">
          {session.description}
        </FieldLabel>

        <div className="flex justify-between italic *:text-[12px] md:col-span-2">
          <CardDescription>Created {createdDate}</CardDescription>
          <CardDescription> Updated {updatedDate}</CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};
