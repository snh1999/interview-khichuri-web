import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ISessionWithQuestions } from "@/api/sessions";
import type { IInterview } from "@/api/sessions/interviews.ts";
import { InterviewsSection } from "@/components/interview/InterviewsSection.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

const CREATED_PATTERN = /^Created · /;

const envelope = <T,>(data: T) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const makeSession = (
  overrides: Partial<ISessionWithQuestions> = {}
): ISessionWithQuestions => ({
  createdAt: CREATED_AT,
  description: "Frontend prep",
  experience: "5 years",
  id: "sess-1",
  isFavorite: false,
  questions: [],
  title: "Frontend prep",
  updatedAt: CREATED_AT,
  ...overrides,
});

const makeInterview = (overrides: Partial<IInterview> = {}): IInterview => ({
  createdAt: CREATED_AT,
  focusTypes: [],
  id: "int-1",
  mode: "qa_flow",
  sessionId: "sess-1",
  startedAt: CREATED_AT,
  topicNames: [],
  updatedAt: CREATED_AT,
  ...overrides,
});

const interviewsHandler = (interviews: IInterview[]) =>
  http.get("*/api/v1/interviews", () => envelope(interviews));

describe("InterviewsSection", () => {
  beforeEach(() => {
    server.use(
      http.get("*/api/v1/lookups/topics", () => envelope([])),
      interviewsHandler([])
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("shows the empty state and opens the create dialog", async () => {
    const view = render(
      <InterviewsSection sectionId="interviews" session={makeSession()} />
    );

    expect(await view.findByText("No mock interviews yet")).toBeInTheDocument();

    await view.user.click(
      screen.getAllByRole("button", { name: "New mock interview" })[0]
    );

    expect(await screen.findByText("Start Mock Interview")).toBeInTheDocument();
  });

  it("renders an interview item linking to the interview page", async () => {
    server.use(interviewsHandler([makeInterview()]));
    const view = render(
      <InterviewsSection sectionId="interviews" session={makeSession()} />
    );

    expect(
      await view.findByRole("link", { name: CREATED_PATTERN })
    ).toHaveAttribute("href", "/interviews/int-1");
  });
});
