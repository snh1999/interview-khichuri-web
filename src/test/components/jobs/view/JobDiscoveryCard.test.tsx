import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw/http";
import { describe, expect, it } from "vitest";
import type { IJob } from "@/api/jobs";
import { JobDiscoveryCard } from "@/components/jobs/view/JobDiscoveryCard.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const job: IJob = {
  companyId: 11,
  companyName: "Acme",
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "Build things",
  id: "job-1",
  location: "Remote",
  state: "ok",
  title: "Senior Engineer",
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://acme.test/jobs/1",
};

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

describe("JobDiscoveryCard", () => {
  it("shows a job from the tracked list as already tracked", async () => {
    server.use(http.get("*/api/v1/jobs", () => envelope([job])));

    render(<JobDiscoveryCard job={job} />);

    expect(
      await screen.findByRole("button", { name: "Tracked" })
    ).toBeDisabled();
  });

  it("links the company and tracks the job", async () => {
    const tracked: string[] = [];
    server.use(
      http.get("*/api/v1/jobs", () => envelope([])),
      http.post("*/api/v1/jobs/:id/track", ({ params }) => {
        tracked.push(String(params.id));
        return HttpResponse.json({
          data: job,
          message: "OK",
          statusCode: 201,
        });
      })
    );

    const { user } = render(<JobDiscoveryCard job={job} />);

    expect(await screen.findByRole("link", { name: "Acme" })).toHaveAttribute(
      "href",
      "/companies/11"
    );
    expect(
      await screen.findByRole("link", { name: "View posting" })
    ).toHaveAttribute("href", job.url);

    await user.click(await screen.findByRole("button", { name: "Track" }));

    await waitFor(() => {
      expect(tracked).toEqual(["job-1"]);
    });
    expect(
      await screen.findByRole("button", { name: "Tracked" })
    ).toBeDisabled();
  });
});
