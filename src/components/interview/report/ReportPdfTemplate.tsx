import {
  Document as PdfDocument,
  Page as PdfPage,
  Text as PdfText,
  View as PdfView,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { IInterview } from "@/api/sessions/interviews.ts";
import type { ILocalInterviewState } from "@/lib/interviewStorage.ts";

export const SECTION_OPTIONS = [
  { key: "scores", label: "Overall scores" },
  { key: "summary", label: "AI summary" },
  { key: "strengths", label: "Strengths" },
  { key: "improvements", label: "Improvements" },
  { key: "qa", label: "Questions & answers" },
] as const;

export type TSectionKey = (typeof SECTION_OPTIONS)[number]["key"];

interface IReportPdfTemplateProps {
  interview: IInterview;
  archive: ILocalInterviewState | null | undefined;
  sections: TSectionKey[];
}

const sentenceCase = (list: string[] | null | undefined): string[] =>
  (list ?? []).map((item) =>
    item.length > 0 ? item[0].toUpperCase() + item.slice(1) : item
  );

const formatDuration = (seconds: number | null | undefined) => {
  const total = seconds ?? 0;
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}m ${remaining}s`;
};

const NUMBERED_LIST_RE = /^\d+\.\s/;

const renderInline = (text: string): ReactNode =>
  text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <PdfText key={index.toString()} style={{ fontWeight: "bold" }}>
          {part.slice(2, -2)}
        </PdfText>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <PdfText
          key={index.toString()}
          style={{ fontFamily: "Courier", fontSize: 9 }}
        >
          {part.slice(1, -1)}
        </PdfText>
      );
    }
    return part;
  });

const renderMarkdownLine = (line: string, index: number): ReactNode => {
  if (line.startsWith("#### ")) {
    return (
      <PdfText
        key={index}
        style={{ fontSize: 10.5, fontWeight: "bold", marginTop: 6 }}
      >
        {renderInline(line.slice(5))}
      </PdfText>
    );
  }
  if (line.startsWith("### ")) {
    return (
      <PdfText
        key={index}
        style={{ fontSize: 11, fontWeight: "bold", marginTop: 6 }}
      >
        {renderInline(line.slice(4))}
      </PdfText>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <PdfText
        key={index}
        style={{ fontSize: 12, fontWeight: "bold", marginTop: 8 }}
      >
        {renderInline(line.slice(3))}
      </PdfText>
    );
  }
  if (line.startsWith("# ")) {
    return (
      <PdfText
        key={index}
        style={{ fontSize: 13, fontWeight: "bold", marginTop: 8 }}
      >
        {renderInline(line.slice(2))}
      </PdfText>
    );
  }
  if (line.startsWith("- ") || line.startsWith("* ")) {
    return (
      <PdfText key={index} style={{ marginLeft: 8 }}>
        • {renderInline(line.slice(2))}
      </PdfText>
    );
  }
  const numberedMatch = NUMBERED_LIST_RE.exec(line);
  if (numberedMatch) {
    return (
      <PdfText key={index} style={{ marginLeft: 8 }}>
        {numberedMatch[0].trim()}{" "}
        {renderInline(line.slice(numberedMatch[0].length))}
      </PdfText>
    );
  }
  if (line.startsWith("> ")) {
    return (
      <PdfText key={index} style={{ marginLeft: 8, color: "#555555" }}>
        {renderInline(line.slice(2))}
      </PdfText>
    );
  }
  if (line.trim() === "") {
    return null;
  }
  return <PdfText key={index}>{renderInline(line)}</PdfText>;
};

const ContentBlock = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <PdfView
    style={{
      marginBottom: 10,
      padding: 10,
      border: "1pt solid #e5e5e5",
      borderRadius: 3,
    }}
  >
    <PdfText
      style={{
        fontSize: 10.5,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#111111",
        letterSpacing: 0.5,
        textTransform: "uppercase",
      }}
    >
      {title}
    </PdfText>
    <PdfView style={{ gap: 4 }}>{children}</PdfView>
  </PdfView>
);

const StrengthsImprovements = ({
  interview,
  sections,
}: {
  interview: IInterview;
  sections: TSectionKey[];
}) => (
  <ContentBlock title="Strengths & Improvements">
    <PdfView style={{ flexDirection: "row", gap: 8 }}>
      {sections.includes("strengths") ? (
        <PdfView style={{ flex: 1 }}>
          <PdfText
            style={{
              fontSize: 9.5,
              fontWeight: "bold",
              marginBottom: 3,
              color: "#444444",
            }}
          >
            Strengths
          </PdfText>
          {sentenceCase(interview.strengths).length > 0 ? (
            sentenceCase(interview.strengths).map((item) => (
              <PdfText key={item}>• {item}</PdfText>
            ))
          ) : (
            <PdfText style={{ color: "#888888" }}>None recorded</PdfText>
          )}
        </PdfView>
      ) : null}
      {sections.includes("improvements") ? (
        <PdfView style={{ flex: 1 }}>
          <PdfText
            style={{
              fontSize: 9.5,
              fontWeight: "bold",
              marginBottom: 3,
              color: "#444444",
            }}
          >
            Improvements
          </PdfText>
          {sentenceCase(interview.improvements).length > 0 ? (
            sentenceCase(interview.improvements).map((item) => (
              <PdfText key={item}>• {item}</PdfText>
            ))
          ) : (
            <PdfText style={{ color: "#888888" }}>None recorded</PdfText>
          )}
        </PdfView>
      ) : null}
    </PdfView>
  </ContentBlock>
);

const QaSection = ({ archive }: { archive: ILocalInterviewState }) => (
  <ContentBlock title="Questions & Answers">
    {archive.items.map((item, index) => (
      <PdfView key={index.toString()} style={{ marginBottom: 6 }}>
        <PdfText style={{ fontWeight: "bold" }}>
          Q{index + 1}. {item.question}
        </PdfText>
        <PdfText style={{ marginLeft: 8, marginTop: 2 }}>
          A: {item.answer || "(no answer)"}
        </PdfText>
        <PdfText style={{ color: "#888888", marginLeft: 8 }}>
          Time: {item.seconds}s
        </PdfText>
      </PdfView>
    ))}
  </ContentBlock>
);

const renderPageNumber = ({
  pageNumber,
  totalPages,
}: {
  pageNumber: number;
  totalPages: number;
}) => `Page ${pageNumber} / ${totalPages}`;

export const ReportPdfTemplate = ({
  interview,
  archive,
  sections,
}: Readonly<IReportPdfTemplateProps>) => (
  <PdfDocument>
    <PdfPage size="A4" style={{ padding: 28, paddingBottom: 40, fontSize: 10 }}>
      <PdfText style={{ fontSize: 15, fontWeight: "bold", marginBottom: 2 }}>
        Mock Interview Report
      </PdfText>
      <PdfText style={{ color: "#666666", marginBottom: 12 }}>
        Duration: {formatDuration(interview.elapsedSeconds)} ·{" "}
        {new Date(
          interview.completedAt ?? interview.startedAt
        ).toLocaleDateString()}
      </PdfText>

      <PdfView
        style={{ borderBottom: "1pt solid #eeeeee", marginBottom: 14 }}
      />

      {sections.includes("scores") ? (
        <ContentBlock title="Scores">
          <PdfText>Overall: {interview.overallScore ?? 0}/100</PdfText>
          <PdfText>Technical: {interview.technicalScore ?? 0}/100</PdfText>
          <PdfText>
            Communication: {interview.communicationScore ?? 0}/100
          </PdfText>
          <PdfText>
            Problem solving: {interview.problemSolvingScore ?? 0}/100
          </PdfText>
          <PdfText>
            Leadership fit: {interview.leadershipFitScore ?? 0}/100
          </PdfText>
        </ContentBlock>
      ) : null}

      {sections.includes("summary") && interview.summaryMarkdown ? (
        <ContentBlock title="Summary">
          {interview.summaryMarkdown
            .split("\n")
            .map((line, index) => renderMarkdownLine(line, index))}
        </ContentBlock>
      ) : null}

      {sections.includes("strengths") || sections.includes("improvements") ? (
        <StrengthsImprovements interview={interview} sections={sections} />
      ) : null}

      {sections.includes("qa") && archive ? (
        <QaSection archive={archive} />
      ) : null}

      <PdfText
        fixed
        render={renderPageNumber}
        style={{
          position: "absolute",
          bottom: 16,
          right: 28,
          fontSize: 8,
          color: "#999999",
        }}
      />
    </PdfPage>
  </PdfDocument>
);
