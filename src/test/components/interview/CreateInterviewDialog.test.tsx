import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ISessionWithQuestions } from "@/api/sessions";
import { CreateInterviewDialog } from "@/components/interview/CreateInterviewDialog.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { getLocalInterviewState } from "@/lib/interviewStorage";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

const envelope = <T,>(data: T, statusCode = 200, message = "OK") =>
  HttpResponse.json({ data, message, statusCode }, { status: statusCode });

const session: ISessionWithQuestions = {
  createdAt: CREATED_AT,
  description: "Frontend focus",
  experience: "5 years",
  id: "sess-1",
  isFavorite: false,
  jobId: "job-1",
  questions: [],
  sessionTopics: [],
  title: "Frontend prep",
  topicIds: [],
  updatedAt: CREATED_AT,
};

const makeJob = () => ({
  companyId: 11,
  companyName: "Acme",
  createdAt: CREATED_AT,
  description: "Senior role",
  id: "job-1",
  status: "saved",
  title: "Staff Engineer",
  topicIds: [],
  updatedAt: CREATED_AT,
});

describe("CreateInterviewDialog", () => {
  beforeEach(() => {
    server.use(
      http.get("*/api/v1/jobs/job-1", () => envelope(makeJob())),
      http.get("*/api/v1/lookups/topics", () => envelope([]))
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("creates an interview, saves the local draft and confirms", async () => {
    let posted: unknown = null;
    server.use(
      http.post("*/api/v1/interviews", async ({ request }) => {
        posted = await request.json();
        return envelope(
          {
            interview: {
              createdAt: CREATED_AT,
              id: "int-new",
              mode: "qa_flow",
              sessionId: "sess-1",
              startedAt: CREATED_AT,
              updatedAt: CREATED_AT,
            },
            questions: [{ questionText: "" }],
          },
          201,
          "Created"
        );
      })
    );

    const view = render(
      <>
        <CreateInterviewDialog onOpenChange={vi.fn()} open session={session} />
        <Toaster />
      </>
    );

    await view.findByText("Start Mock Interview");
    await view.user.type(
      screen.getByLabelText("Number of questions (optional)"),
      "4"
    );
    await view.user.click(screen.getAllByLabelText("Resume")[0]);
    await view.user.click(screen.getByRole("button", { name: "Start" }));

    expect(
      await screen.findByText("Mock interview started")
    ).toBeInTheDocument();
    expect(posted).toMatchObject({
      focusTypes: ["resume"],
      mode: "qa_flow",
      provider: "google",
      questionCount: 4,
      sessionId: "sess-1",
      topicNames: [],
    });

    const draft = await getLocalInterviewState("int-new");
    expect(draft).toMatchObject({
      interviewId: "int-new",
      mode: "qa_flow",
      sessionId: "sess-1",
    });
    expect(draft?.questions).toEqual([
      expect.objectContaining({ questionText: "Question 1" }),
    ]);
  });
});
