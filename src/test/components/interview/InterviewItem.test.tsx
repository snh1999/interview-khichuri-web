import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { IInterview } from "@/api/sessions/interviews.ts";
import { InterviewItem } from "@/components/interview/InterviewItem.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { setLocalInterviewState } from "@/lib/interviewStorage";
import { render } from "@/test/render.tsx";

const CREATED_PATTERN = /^Created · /;
const IN_PROGRESS_PATTERN = /^In progress · /;
const COMPLETED_PATTERN = /^Completed · /;
const SCORE_SUFFIX_PATTERN = /%$/;

const makeInterview = (overrides: Partial<IInterview> = {}): IInterview => ({
  id: "int-1",
  sessionId: "sess-1",
  mode: "qa_flow",
  focusTypes: [],
  topicNames: [],
  startedAt: "2026-01-05T09:00:00.000Z",
  completedAt: null,
  overallScore: null,
  technicalScore: null,
  communicationScore: null,
  problemSolvingScore: null,
  leadershipFitScore: null,
  elapsedSeconds: null,
  summaryMarkdown: null,
  strengths: [],
  improvements: [],
  createdAt: "2026-01-05T09:00:00.000Z",
  updatedAt: "2026-01-05T09:00:00.000Z",
  ...overrides,
});

describe("InterviewItem", () => {
  it("shows a created interview without a score link to the interview page", async () => {
    const view = render(
      <InterviewItem interview={makeInterview()} onDelete={vi.fn()} />
    );
    const link = await view.findByRole("link", { name: CREATED_PATTERN });
    expect(link).toHaveAttribute("href", "/interviews/int-1");
    expect(screen.queryByText(SCORE_SUFFIX_PATTERN)).not.toBeInTheDocument();
  });

  it("shows the answered count for an in-progress interview", async () => {
    await setLocalInterviewState({
      interviewId: "int-2",
      sessionId: "sess-1",
      mode: "qa_flow",
      provider: "openai",
      startedAt: 0,
      currentIndex: 0,
      questions: [],
      items: [
        { questionId: 1, question: "Q1?", answer: "yes", seconds: 10 },
        { questionId: 2, question: "Q2?", answer: "", seconds: 10 },
      ],
    });
    const view = render(
      <InterviewItem
        interview={makeInterview({ id: "int-2" })}
        onDelete={vi.fn()}
      />
    );
    await view.findByRole("link", { name: IN_PROGRESS_PATTERN });
    expect(screen.getByText("1 answered")).toBeInTheDocument();
  });

  it("shows the overall score for a completed interview", async () => {
    const view = render(
      <InterviewItem
        interview={makeInterview({
          completedAt: "2026-01-06T09:00:00.000Z",
          overallScore: 85,
          elapsedSeconds: 300,
        })}
        onDelete={vi.fn()}
      />
    );
    await view.findByRole("link", { name: COMPLETED_PATTERN });
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("5m 0s")).toBeInTheDocument();
  });

  it("deletes after confirmation", async () => {
    const interview = makeInterview();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const view = render(
      <>
        <Toaster />
        <InterviewItem interview={interview} onDelete={onDelete} />
      </>
    );
    await view.findByRole("link", { name: CREATED_PATTERN });
    await view.user.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("alertdialog");
    await view.user.click(
      within(dialog).getByRole("button", { name: "Delete" })
    );
    expect(onDelete).toHaveBeenCalledWith(interview);
    expect(await view.findByText("Mock interview deleted")).toBeInTheDocument();
  });
});
