import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { IInterview } from "@/api/sessions/interviews.ts";
import { RecentInterviewsSection } from "@/components/dashboard/RecentInterviewsSection.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const makeInterview = (id: string, createdAt: string): IInterview => ({
  id,
  sessionId: "sess-1",
  mode: "qa_flow",
  focusTypes: [],
  topicNames: [],
  startedAt: createdAt,
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
  createdAt,
  updatedAt: createdAt,
});

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const CREATED_TITLE = /^Created · /;

describe("RecentInterviewsSection", () => {
  it("shows the latest incomplete interviews without delete actions", async () => {
    let search = "";
    server.use(
      http.get("*/api/v1/interviews", ({ request }) => {
        const { search: query } = new URL(request.url);
        search = query;
        return envelope(
          Array.from({ length: 5 }).map((_, index) =>
            makeInterview(`int-${index}`, `2026-01-0${5 - index}T00:00:00.000Z`)
          )
        );
      })
    );
    const view = render(<RecentInterviewsSection />);

    expect(await view.findByText("Recent interviews")).toBeInTheDocument();
    expect(
      await view.findAllByRole("link", { name: CREATED_TITLE })
    ).toHaveLength(5);
    expect(search).toBe("?completed=false&limit=5");
    expect(
      screen.queryByRole("button", { name: "Delete" })
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no interviews are in progress", async () => {
    server.use(http.get("*/api/v1/interviews", () => envelope([])));
    const view = render(<RecentInterviewsSection />);

    expect(
      await view.findByText("No interviews in progress.")
    ).toBeInTheDocument();
  });
});
