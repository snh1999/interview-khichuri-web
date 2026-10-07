import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { IJob } from "@/api/jobs";
import type { IPrepSession } from "@/api/sessions";
import { LinkedSessionsSection } from "@/components/jobs/LinkedSessionsSection.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const JOB_ONE_ID: IJob = { id: "job-1" } as IJob;

const makeSession = (id: string, jobId: string | null): IPrepSession => ({
  id,
  title: `Session ${id}`,
  description: "Linked topic",
  topicIds: [],
  createdAt: "2026-01-05T00:00:00.000Z",
  updatedAt: "2026-01-05T00:00:00.000Z",
  jobId,
  isFavorite: false,
  experience: null,
});

const useLinkedSessionsResponse = (sessions: IPrepSession[]) =>
  server.use(
    http.get("*/api/v1/prep-session", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: sessions })
    ),
    http.get("*/api/v1/lookups/topics", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: [] })
    )
  );

describe("LinkedSessionsSection", () => {
  it("renders only sessions linked to the given job", async () => {
    useLinkedSessionsResponse([
      makeSession("linked-1", "job-1"),
      makeSession("linked-2", "job-1"),
      makeSession("other", "job-2"),
    ]);
    const view = render(<LinkedSessionsSection job={JOB_ONE_ID} />);
    expect(await view.findByText("Session linked-1")).toBeInTheDocument();
    expect(screen.getByText("Session linked-2")).toBeInTheDocument();
    expect(screen.queryByText("Session other")).not.toBeInTheDocument();
  });

  it("shows the empty state when no session matches", async () => {
    useLinkedSessionsResponse([makeSession("other", "job-2")]);
    const view = render(<LinkedSessionsSection job={JOB_ONE_ID} />);
    expect(
      await view.findByText("No sessions linked yet.")
    ).toBeInTheDocument();
  });
});
