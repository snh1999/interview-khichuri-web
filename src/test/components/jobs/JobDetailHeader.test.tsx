import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { IJobWithTopics } from "@/api/jobs";
import { JobDetailHeader } from "@/components/jobs/details/JobDetailHeader.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

const JOB: IJobWithTopics = {
  companyName: "Acme Corp",
  createdAt: CREATED_AT,
  description: "Senior frontend engineer at a fintech scaleup.",
  id: "job-1",
  title: "Senior Frontend",
  topicIds: [],
  track: {
    id: "track-1",
    jobId: "job-1",
    status: "saved",
    isFavorite: false,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  updatedAt: CREATED_AT,
};

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const baseHandlers = () => [
  http.get("*/api/v1/lookups/roles", () => envelope([])),
  http.get("*/api/v1/lookups/topics", () => envelope([])),
  http.get("*/api/v1/company", () => envelope([])),
  http.get("*/api/v1/resume", () => envelope([])),
];

describe("JobDetailHeader", () => {
  beforeEach(() => {
    server.use(...baseHandlers());
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("asks again and forces the delete when the job still has prep sessions", async () => {
    const requestedUrls: string[] = [];
    server.use(
      http.delete("*/api/v1/jobs/:id", ({ request }) => {
        const url = new URL(request.url);
        requestedUrls.push(url.search);
        if (!url.searchParams.has("force")) {
          return HttpResponse.json(
            {
              code: "TRACKED_JOB_HAS_PREP_SESSIONS",
              count: 2,
              hasPrepSessions: true,
            },
            { status: 409 }
          );
        }
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = render(<JobDetailHeader job={JOB} />);

    await user.click(await screen.findByRole("button", { name: "Delete job" }));
    const buttons = await screen.findAllByRole("button", {
      name: "Delete job",
    });
    await user.click(buttons.at(-1) as HTMLElement);

    expect(
      await screen.findByText("This job has prep sessions")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete anyway" }));

    expect(requestedUrls).toEqual(["", "?force=1"]);
  });

  it("keeps the force-delete dialog open when the forced delete fails", async () => {
    server.use(
      http.delete("*/api/v1/jobs/:id", ({ request }) => {
        const url = new URL(request.url);
        return url.searchParams.has("force")
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json({ hasPrepSessions: true }, { status: 409 });
      })
    );

    const { user } = render(<JobDetailHeader job={JOB} />);

    await user.click(await screen.findByRole("button", { name: "Delete job" }));
    const buttons = await screen.findAllByRole("button", {
      name: "Delete job",
    });
    await user.click(buttons.at(-1) as HTMLElement);
    await user.click(
      await screen.findByRole("button", { name: "Delete anyway" })
    );

    expect(
      await screen.findByRole("button", { name: "Delete anyway" })
    ).toBeInTheDocument();
  });

  it("tracks a system job that is not in My jobs yet", async () => {
    const tracked: string[] = [];
    server.use(
      http.post("*/api/v1/jobs/:id/track", ({ params }) => {
        tracked.push(String(params.id));
        return HttpResponse.json({
          data: { ...JOB, track: JOB.track },
          message: "OK",
          statusCode: 201,
        });
      })
    );

    const { user } = render(
      <JobDetailHeader job={{ ...JOB, track: null, userId: null }} />
    );

    await user.click(await screen.findByRole("button", { name: "Track" }));

    await waitFor(() => {
      expect(tracked).toEqual(["job-1"]);
    });
  });

  it("shows tracking controls instead of canonical editing for system jobs", async () => {
    const { user } = render(
      <JobDetailHeader
        job={{
          ...JOB,
          closedAt: "2026-02-01T00:00:00.000Z",
          state: "failed",
          userId: null,
        }}
      />
    );

    expect(await screen.findByText("Closed")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(await screen.findByLabelText("Status")).toBeInTheDocument();
    expect(screen.queryByLabelText("Title")).toBeNull();
  });

  it("keeps canonical editing for private jobs", async () => {
    render(<JobDetailHeader job={{ ...JOB, userId: "user-1" }} />);

    expect(
      await screen.findByRole("button", { name: "Edit" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit tracking" })).toBeNull();
  });

  it("links the job source when it is an http URL", async () => {
    render(
      <JobDetailHeader job={{ ...JOB, url: "https://acme.com/jobs/1" }} />
    );

    expect(
      await screen.findByRole("link", { name: "https://acme.com/jobs/1" })
    ).toHaveAttribute("href", "https://acme.com/jobs/1");
  });

  it("does not link unsafe source URLs", async () => {
    render(<JobDetailHeader job={{ ...JOB, url: "javascript:alert(1)" }} />);

    expect(await screen.findByText("javascript:alert(1)")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "javascript:alert(1)" })
    ).toBeNull();
  });
});
