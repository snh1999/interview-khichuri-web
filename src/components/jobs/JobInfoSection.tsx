import type { IJobWithTopics } from "@/api/jobs";
import { MarkdownContent } from "@/components/common/MarkdownContent.tsx";
import { parseJobLinks } from "@/components/jobs/jobs.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface IProps {
  sectionId: string;
  job: IJobWithTopics;
}

export const JobInfoSection = ({ sectionId, job }: IProps) => {
  const links = parseJobLinks(job.links);
  const notes = job.track?.notes;

  return (
    <div className="space-y-4" id={sectionId}>
      <Card className="px-1">
        <CardHeader className="border-b">
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <MarkdownContent content={job.description ?? ""} />
        </CardContent>
      </Card>

      {notes ? (
        <Card className="px-1">
          <CardHeader className="border-b">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="wrap-break-word whitespace-pre-wrap text-sm">
              {notes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {links.length > 0 ? (
        <Card className="px-1">
          <CardHeader className="border-b">
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 pt-4">
            {links.map((link) => (
              <Button
                className="justify-start! h-auto break-all py-0 text-sm"
                key={`${link.url}-${link.label ?? ""}`}
                render={
                  <a
                    href={link.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                }
                variant="link"
              >
                {link.label || link.url}
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
