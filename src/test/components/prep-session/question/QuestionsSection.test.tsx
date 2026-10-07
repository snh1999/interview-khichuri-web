import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import type { IJobWithTopics } from "@/api/jobs";
import type { IPrepSession, IQuestion } from "@/api/sessions";
import { QuestionsSection } from "@/components/prep-session/question/QuestionsSection.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const makeSession = (overrides: Partial<IPrepSession> = {}): IPrepSession => ({
  id: "sess-1",
  title: "System design",
  description: "Prep",
  topicIds: [],
  createdAt: "2026-01-05T00:00:00.000Z",
  updatedAt: "2026-01-05T00:00:00.000Z",
  jobId: "job-1",
  isFavorite: false,
  experience: "Senior",
  ...overrides,
});

const makeQuestion = (overrides: Partial<IQuestion> = {}): IQuestion => ({
  id: 1,
  sessionId: "sess-1",
  questionText: "Design a rate limiter",
  answer: "Token bucket",
  notes: "tip",
  isFavorite: false,
  createdAt: "2026-01-05T00:00:00.000Z",
  updatedAt: "2026-01-05T00:00:00.000Z",
  ...overrides,
});

const useQuestionsResponse = (questions: IQuestion[]) =>
  server.use(
    http.get("*/api/v1/prep-session/sess-1/questions", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: questions })
    ),
    http.get("*/api/v1/jobs/job-1", () =>
      HttpResponse.json({
        statusCode: 200,
        message: "OK",
        data: {
          id: "job-1",
          title: "Staff Engineer",
          companyName: "Acme",
          description: "Senior-level role",
          status: "applied",
          isFavorite: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          topicIds: [] as number[],
        } satisfies IJobWithTopics,
      })
    ),
    http.get("*/api/v1/lookups/topics", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: [] })
    )
  );

const SESSION_ROUTE = "/sessions/3f9a5a00-0000-4000-8000-000000000000";

const renderSection = (
  questions: IQuestion[] = [],
  session: IPrepSession = makeSession()
) => {
  useQuestionsResponse(questions);
  return render(
    <Routes>
      <Route
        element={<QuestionsSection sectionId="questions" session={session} />}
        path="/sessions/:sessionId"
      />
    </Routes>,
    { route: SESSION_ROUTE }
  );
};

describe("QuestionsSection", () => {
  it("renders all questions and filters by search", async () => {
    const view = await renderSection([
      makeQuestion(),
      makeQuestion({
        id: 2,
        questionText: "Design a load balancer",
        isFavorite: true,
        answer: null,
      }),
      makeQuestion({
        id: 3,
        questionText: "What is caching?",
        answer: null,
      }),
    ]);
    await view.findByText("Design a rate limiter");
    expect(screen.getByText("Design a load balancer")).toBeInTheDocument();
    expect(screen.getByText("What is caching?")).toBeInTheDocument();

    await view.user.type(
      screen.getByPlaceholderText("Search questions..."),
      "rate"
    );
    expect(screen.getByText("Design a rate limiter")).toBeInTheDocument();
    expect(
      screen.queryByText("Design a load balancer")
    ).not.toBeInTheDocument();
  });

  it("filters by pinned and unanswered", async () => {
    const view = await renderSection([
      makeQuestion(),
      makeQuestion({
        id: 2,
        questionText: "Design a load balancer",
        isFavorite: true,
        answer: null,
      }),
    ]);
    await view.findByText("Design a rate limiter");
    await view.user.click(screen.getByRole("button", { name: "Pinned" }));
    expect(screen.getByText("Design a load balancer")).toBeInTheDocument();
    expect(screen.queryByText("Design a rate limiter")).not.toBeInTheDocument();

    await view.user.click(screen.getByRole("button", { name: "Unanswered" }));
    expect(screen.getByText("Design a load balancer")).toBeInTheDocument();
    expect(screen.queryByText("Design a rate limiter")).not.toBeInTheDocument();
  });

  it("shows the empty state when no questions exist", async () => {
    const view = await renderSection([]);
    expect(await view.findByText("No questions yet")).toBeInTheDocument();
    expect(
      screen.getByText("Generate questions with AI or add one manually.")
    ).toBeInTheDocument();
  });

  it("opens the add-question form from the options menu", async () => {
    const view = await renderSection([makeQuestion()]);
    await view.findByText("Design a rate limiter");
    await view.user.click(
      screen.getByRole("button", { name: "Question options" })
    );
    await view.user.keyboard("{ArrowDown}");
    await view.user.keyboard("{Enter}");
    expect(await view.findByLabelText("Question text")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Question" })
    ).toBeInTheDocument();
  });

  it("opens the generate dialog with count options", async () => {
    const view = await renderSection([]);
    await view.findByText("No questions yet");
    await view.user.click(
      screen.getByRole("button", { name: "Generate Questions" })
    );
    expect(await view.findByLabelText("Number of questions")).toHaveValue(5);
    expect(
      screen.getAllByText("Avoid repeating previous questions").length
    ).toBeGreaterThan(0);
  });

  it("expands every question from the options menu", async () => {
    const view = await renderSection([
      makeQuestion(),
      makeQuestion({ id: 2, questionText: "Design a load balancer" }),
    ]);
    await view.findByText("Design a rate limiter");

    await view.user.click(
      screen.getByRole("button", { name: "Question options" })
    );
    await view.user.click(await screen.findByText("Expand All"));
    expect(screen.getAllByText("Token bucket").length).toBe(2);
  });

  it("toggles notes visibility from the options menu", async () => {
    const view = await renderSection([makeQuestion()]);
    await view.findByText("Design a rate limiter");

    await view.user.click(
      screen.getByRole("button", { name: "Question options" })
    );
    await view.user.click(await screen.findByText("Show Notes"));
    expect(await screen.findByText("Hide Notes")).toBeInTheDocument();
  });

  it("closes the add form on escape", async () => {
    const view = await renderSection([makeQuestion()]);
    await view.findByText("Design a rate limiter");

    await view.user.click(
      screen.getByRole("button", { name: "Question options" })
    );
    await view.user.click(await screen.findByText("Add Question"));
    expect(await view.findByLabelText("Question text")).toBeInTheDocument();

    await view.user.keyboard("{Escape}");
    expect(screen.queryByLabelText("Question text")).not.toBeInTheDocument();
  });
});
