import { FilePdfIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  type IInterview,
  useInterviewArchive,
} from "@/api/sessions/interviews.ts";
import { MarkdownContent } from "@/components/common/MarkdownContent.tsx";
import { ScoreSection } from "@/components/interview/report/ScoreSection.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { InterviewPdfExport } from "./InterviewPdfExport.tsx";

const sentenceCase = (list: string[] | null | undefined): string[] =>
  (list ?? []).map((item) =>
    item.length > 0 ? item[0].toUpperCase() + item.slice(1) : item
  );

interface IProps {
  interview: IInterview;
}

export const InterviewReport = ({ interview }: IProps) => {
  const duration = interview.elapsedSeconds ?? 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const [pdfOpen, setPdfOpen] = useState(false);
  const { data: archive } = useInterviewArchive(interview.id, true);

  const handleExportDialogOpen = () => setPdfOpen(true);

  const formatItemSeconds = (itemSeconds: number) => {
    const itemMinutes = Math.floor(itemSeconds / 60);
    const itemRemainder = itemSeconds % 60;
    return itemMinutes > 0
      ? `${itemMinutes}m ${itemRemainder}s`
      : `${itemRemainder}s`;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-xl">Mock Interview Report</h1>
        <div className="flex items-center gap-2">
          <Badge className="tracking-wide" variant="secondary">
            {minutes}m {seconds}s
          </Badge>
          <Button onClick={handleExportDialogOpen}>
            <FilePdfIcon className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <ScoreSection interview={interview} />

      {interview.summaryMarkdown ? (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              AI evaluation of your performance in this interview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MarkdownContent content={interview.summaryMarkdown} />
          </CardContent>
        </Card>
      ) : null}

      {archive && archive.items.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Questions &amp; Answers</CardTitle>
            <CardDescription>
              Your full transcript from this session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {archive.items.map((item) => (
              <div
                className="space-y-1 border-border border-l-2 pl-4"
                key={item.questionId}
              >
                <p className="text-sm">
                  <span className="font-semibold">Q{item.questionId}. </span>
                  {item.question}
                </p>
                <p className="text-muted-foreground text-sm">
                  <span className="font-semibold text-foreground">A. </span>
                  {item.answer.trim() || "(no answer recorded)"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Time: {formatItemSeconds(item.seconds)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Strengths</CardTitle>
            <CardDescription>What you did well.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {sentenceCase(interview.strengths).length > 0 ? (
                sentenceCase(interview.strengths).map((item) => (
                  <li key={item}>{item}</li>
                ))
              ) : (
                <li className="text-muted-foreground">
                  No strengths recorded.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improvements</CardTitle>
            <CardDescription>Areas to focus on next time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {sentenceCase(interview.improvements).length > 0 ? (
                sentenceCase(interview.improvements).map((item) => (
                  <li key={item}>{item}</li>
                ))
              ) : (
                <li className="text-muted-foreground">
                  No improvements recorded.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <InterviewPdfExport
        interview={interview}
        onOpenChange={setPdfOpen}
        open={pdfOpen}
      />
    </div>
  );
};
