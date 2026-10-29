import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import type { IJobWithTopics } from "@/api/jobs";
import type { IPrepSession, IQuestion } from "@/api/sessions";
import { SessionInfoSection } from "@/components/prep-session/session/SessionInfoSection.tsx";
import { formatDate } from "@/lib/date.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const LocationProbe = () => <p>{`path=${useLocation().pathname}`}</p>;

const LONG_DESCRIPTION = "d".repeat(300);

const makeSession = (overrides: Partial<IPrepSession> = {}): IPrepSession => ({
  id: "sess-1",
  title: "System design deep dive",
  description: "Short description",
  topicIds: [],
  createdAt: "2026-01-05T00:00:00.000Z",
  updatedAt: "2026-01-10T00:00:00.000Z",
  jobId: "job-1",
  isFavorite: false,
  experience: "Senior",
  ...overrides,
});

const makeQuestion = (overrides: Partial<IQuestion> = {}): IQuestion => ({
  id: 1,
  sessionId: "sess-1",
  questionText: "What is a load balancer?",
  answer: null,
  notes: null,
  isFavorite: true,
  createdAt: "2026-01-06T00:00:00.000Z",
  updatedAt: "2026-01-06T00:00:00.000Z",
  ...overrides,
});

const useDetailResponse = (
  questions: IQuestion[],
  jobOverride?: Partial<IJobWithTopics>
) =>
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
          description: "A role.",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          track: {
            id: "track-1",
            jobId: "job-1",
            status: "applied",
            isFavorite: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
          ...jobOverride,
        },
      })
    ),
    http.get("*/api/v1/lookups/topics", () =>
      HttpResponse.json({
        statusCode: 200,
        message: "OK",
        data: [{ id: 7, name: "System design", isApproved: true }],
      })
    )
  );

const renderSection = async (
  session: IPrepSession,
  questions: IQuestion[] = []
) => {
  useDetailResponse(questions);
  const view = render(
    <>
      <LocationProbe />
      <SessionInfoSection session={session} />
    </>
  );
  await view.findByText(session.title);
  return view;
};

describe("SessionInfoSection", () => {
  it("renders title, topic badges, linked job, and question/pin badges", async () => {
    const view = await renderSection(makeSession({ topicIds: [7] }), [
      makeQuestion(),
      makeQuestion({ id: 2, isFavorite: false }),
      makeQuestion({ id: 3, isFavorite: false }),
    ]);
    expect(screen.getByText("System design deep dive")).toBeInTheDocument();
    expect(screen.getByText("System design")).toBeInTheDocument();
    expect(
      await view.findByRole("button", { name: "Acme - Staff Engineer" })
    ).toBeInTheDocument();
    expect(screen.getByText("3 questions")).toBeInTheDocument();
    expect(screen.getByText("1 pinned")).toBeInTheDocument();
    expect(
      screen.getByText(`Updated ${formatDate("2026-01-10T00:00:00.000Z")}`)
    ).toBeInTheDocument();
    expect(screen.getByText("Senior")).toBeInTheDocument();
    await view.user.click(
      screen.getByRole("button", { name: "Acme - Staff Engineer" })
    );
    await view.findByText("path=/jobs/job-1");
  });

  it("collapses long descriptions and expands on demand", async () => {
    const view = await renderSection(
      makeSession({ description: LONG_DESCRIPTION })
    );
    expect(
      screen.getByText((content) => content.endsWith("…"))
    ).toBeInTheDocument();
    expect(screen.queryByText("See less")).not.toBeInTheDocument();
    await view.user.click(screen.getByRole("button", { name: "See more" }));
    expect(screen.getByText(LONG_DESCRIPTION)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "See less" })
    ).toBeInTheDocument();
  });

  it("deletes the session after confirmation and navigates to sessions", async () => {
    let deleted = "";
    server.use(
      http.delete("*/api/v1/prep-session/sess-1", () => {
        deleted = "sess-1";
        return HttpResponse.json({
          statusCode: 200,
          message: "OK",
          data: null,
        });
      })
    );
    const view = await renderSection(makeSession());
    await view.user.click(
      screen.getByRole("button", { name: "Delete session" })
    );
    await screen.findByRole("alertdialog");
    await view.user.click(screen.getByRole("button", { name: "Delete" }));
    await view.findByText("path=/sessions");
    expect(deleted).toBe("sess-1");
  });
});
