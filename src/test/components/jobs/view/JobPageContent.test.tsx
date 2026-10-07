import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { IJob } from "@/api/jobs";
import {
  filterJobs,
  JobPageContent,
} from "@/components/jobs/view/JobPageContent.tsx";
import { useJobsStore } from "@/store/useJobsStore.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const makeJob = (overrides: Partial<IJob> = {}): IJob => ({
  id: "job-1",
  title: "Staff Engineer",
  companyName: "Acme",
  description: "A senior role.",
  status: "applied",
  links: null,
  isFavorite: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  topicIds: [],
  ...overrides,
});

const useJobsResponse = (jobs: IJob[]) =>
  server.use(
    http.get("*/api/v1/jobs", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: jobs })
    )
  );

const renderList = (onCreate = vi.fn()) => {
  useJobsResponse([
    makeJob({ id: "j1", title: "Alpha", status: "applied" }),
    makeJob({ id: "j2", title: "Beta", status: "saved" }),
  ]);
  const view = render(
    <JobPageContent currentSort="default" onCreate={onCreate} />
  );
  return { ...view, onCreate };
};

describe("filterJobs", () => {
  const jobs: IJob[] = [
    makeJob({ id: "a", status: "applied" }),
    makeJob({ id: "b", status: "saved" }),
  ];

  it("filters by status", () => {
    expect(filterJobs(jobs, { status: "applied" })).toEqual([jobs[0]]);
    expect(filterJobs(jobs, { status: "saved" })).toEqual([jobs[1]]);
  });

  it("keeps everything when no filters are applied", () => {
    expect(filterJobs(jobs, {})).toEqual(jobs);
  });

  it("drops jobs outside the applied date window", () => {
    const windowed = filterJobs(jobs, {
      dateFilter: [{ type: "applied", from: "2026-01-02", to: "2026-01-31" }],
    });
    expect(windowed).toEqual([]);
  });
});

describe("JobPageContent", () => {
  it("renders jobs in a grid", async () => {
    const view = renderList();
    expect(await view.findByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("shows the empty state with a create button", async () => {
    useJobsResponse([]);
    const onCreate = vi.fn();
    const view = render(
      <JobPageContent currentSort="default" onCreate={onCreate} />
    );
    expect(
      await view.findByText(
        "Add your first job posting to get started. Press Ctrl+v to paste from clipboard."
      )
    ).toBeInTheDocument();
    await view.user.click(screen.getByRole("button", { name: "New Job" }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("filters the grid by status from the store", async () => {
    useJobsStore.setState({ status: "applied" });
    const view = renderList();
    await view.findByText("Alpha");
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });
});
