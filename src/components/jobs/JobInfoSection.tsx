import type { IJobWithTopics } from "@/api/jobs";
import { MarkdownContent } from "@/components/common/MarkdownContent.tsx";
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
  const formattedLinks = job.links ? job.links.split("\n").filter(Boolean) : [];

  return (
    <div className="space-y-4" id={sectionId}>
      <Card className="px-1">
        <CardHeader className="border-b">
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <MarkdownContent content={job.description} />
        </CardContent>
      </Card>

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
    </div>
  );
};
