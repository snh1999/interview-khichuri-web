import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { IInterview } from "@/api/sessions/interviews.ts";
import { InterviewReport } from "@/components/interview/report/InterviewReport.tsx";
import { archiveLocalInterviewState } from "@/lib/interviewStorage";
import { render } from "@/test/render.tsx";

const EXPORT_PATTERN = /Export/;

const makeInterview = (overrides: Partial<IInterview> = {}): IInterview => ({
  id: "int-1",
  sessionId: "sess-1",
  mode: "qa_flow",
  focusTypes: [],
  topicNames: [],
  startedAt: "2026-01-05T09:00:00.000Z",
  completedAt: "2026-01-06T09:00:00.000Z",
  overallScore: 85,
  technicalScore: 70,
  communicationScore: 90,
  problemSolvingScore: 80,
  leadershipFitScore: 60,
  elapsedSeconds: 300,
  summaryMarkdown: "## Solid performance overall",
  strengths: ["clear communication", "fast delivery"],
  improvements: ["needs more depth"],
  createdAt: "2026-01-05T09:00:00.000Z",
  updatedAt: "2026-01-05T09:00:00.000Z",
  ...overrides,
});

describe("InterviewReport", () => {
  it("renders header, score badges, and markdown summary", async () => {
    const view = render(<InterviewReport interview={makeInterview()} />);
    expect(
      await view.findByRole("heading", { name: "Mock Interview Report" })
    ).toBeInTheDocument();
    expect(screen.getByText("5m 0s")).toBeInTheDocument();
    expect(screen.getByText("Overall")).toBeInTheDocument();
    expect(screen.getByText("Technical")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
    expect(screen.getByText("Solid performance overall")).toBeInTheDocument();
  });

  it("sentence-cases strengths and improvements", async () => {
    const view = render(<InterviewReport interview={makeInterview()} />);
    await view.findByText("Clear communication");
    expect(screen.getByText("Fast delivery")).toBeInTheDocument();
    expect(screen.getByText("Needs more depth")).toBeInTheDocument();
  });

  it("renders the archived transcript questions", async () => {
    await archiveLocalInterviewState({
      interviewId: "int-1",
      sessionId: "sess-1",
      mode: "qa_flow",
      provider: "openai",
      startedAt: 0,
      currentIndex: 2,
      questions: [],
      items: [
        {
          questionId: 1,
          question: "Tell me about yourself",
          answer: "I build things.",
          seconds: 90,
        },
      ],
    });
    const view = render(<InterviewReport interview={makeInterview()} />);
    expect(await view.findByText("Questions & Answers")).toBeInTheDocument();
    expect(screen.getByText("Tell me about yourself")).toBeInTheDocument();
    expect(screen.getByText("I build things.")).toBeInTheDocument();
    expect(screen.getByText("Time: 1m 30s")).toBeInTheDocument();
  });

  it("hides the transcript when the archive is empty", async () => {
    const view = render(
      <InterviewReport interview={makeInterview({ id: "int-empty" })} />
    );
    await view.findByText("Mock Interview Report");
    expect(screen.queryByText("Questions & Answers")).not.toBeInTheDocument();
  });

  it("exposes the PDF export button", async () => {
    const view = render(<InterviewReport interview={makeInterview()} />);
    await view.findByText("Mock Interview Report");
    expect(
      screen.getByRole("button", { name: EXPORT_PATTERN })
    ).toBeInTheDocument();
  });
});
