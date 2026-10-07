import { describe, expect, it, vi } from "vitest";
import type { IInterview } from "@/api/sessions/interviews.ts";
import {
  ReportPdfTemplate,
  type TSectionKey,
} from "@/components/interview/report/ReportPdfTemplate.tsx";
import { render } from "@/test/render.tsx";

vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const DURATION_RE = /Duration: 2m 5s/;
const OVERALL_RE = /Overall: 42\/100/;
const PROBLEM_RE = /Problem solving: 0\/100/;
const TITLE_RE = /Title/;
const SECTION_RE = /Section/;
const SUB_RE = /Sub/;
const DEEP_RE = /Deep/;
const BULLET_RE = /bullet/;
const FIRST_RE = /first/;
const QUOTED_RE = /quoted/;
const STRENGTH_RE = /Clear communication/;
const IMPROVEMENT_RE = /Slow delivery/;
const ZERO_DURATION_RE = /Duration: 0m 0s/;

const ALL_SECTIONS: TSectionKey[] = [
  "scores",
  "summary",
  "strengths",
  "improvements",
  "qa",
];

const interview = {
  communicationScore: 50,
  completedAt: null,
  elapsedSeconds: 125,
  leadershipFitScore: 60,
  overallScore: 42,
  problemSolvingScore: null,
  startedAt: "2024-01-01T00:00:00.000Z",
  summaryMarkdown:
    "# Title\n## Section\n### Sub\n#### Deep\n- bullet\n* star\n1. first\n> quoted\n\n**bold** and `code` and plain\n",
  technicalScore: 30,
} as unknown as IInterview;

describe("ReportPdfTemplate", () => {
  it("renders scores, markdown summary and Q&A", () => {
    const { getByText } = render(
      <ReportPdfTemplate
        archive={
          {
            items: [{ answer: "A one", question: "Q one", seconds: 5 }],
          } as never
        }
        interview={interview}
        sections={ALL_SECTIONS}
      />
    );

    expect(getByText("Mock Interview Report")).toBeInTheDocument();
    expect(getByText(DURATION_RE)).toBeInTheDocument();
    expect(getByText(OVERALL_RE)).toBeInTheDocument();
    expect(getByText(PROBLEM_RE)).toBeInTheDocument();

    expect(getByText(TITLE_RE)).toBeInTheDocument();
    expect(getByText(SECTION_RE)).toBeInTheDocument();
    expect(getByText(SUB_RE)).toBeInTheDocument();
    expect(getByText(DEEP_RE)).toBeInTheDocument();
    expect(getByText(BULLET_RE)).toBeInTheDocument();
    expect(getByText(FIRST_RE)).toBeInTheDocument();
    expect(getByText(QUOTED_RE)).toBeInTheDocument();
    expect(getByText("bold")).toBeInTheDocument();
    expect(getByText("code")).toBeInTheDocument();
    expect(getByText("Strengths & Improvements")).toBeInTheDocument();
  });

  it("omits sections that are not selected", () => {
    const { queryByText } = render(
      <ReportPdfTemplate
        archive={null}
        interview={interview}
        sections={["qa"]}
      />
    );

    expect(queryByText("Overall: 42/100")).toBeNull();
    expect(queryByText("Summary")).toBeNull();
    expect(queryByText("Overall scores")).toBeNull();
  });

  it("renders strengths and improvements with sentence casing", () => {
    const { getByText } = render(
      <ReportPdfTemplate
        archive={null}
        interview={
          {
            ...interview,
            improvements: ["slow delivery"],
            strengths: ["clear communication"],
          } as unknown as IInterview
        }
        sections={["strengths", "improvements"]}
      />
    );

    expect(getByText(STRENGTH_RE)).toBeInTheDocument();
    expect(getByText(IMPROVEMENT_RE)).toBeInTheDocument();
  });

  it("falls back to the start date when not completed", () => {
    const { getByText } = render(
      <ReportPdfTemplate
        archive={null}
        interview={
          {
            ...interview,
            elapsedSeconds: null,
          } as unknown as IInterview
        }
        sections={[]}
      />
    );

    expect(getByText(ZERO_DURATION_RE)).toBeInTheDocument();
  });
});