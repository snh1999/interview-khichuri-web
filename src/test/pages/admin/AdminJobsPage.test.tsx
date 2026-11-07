import { screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { IAdminJob } from "@/api/admin/companies";
import AdminJobsPage from "@/pages/admin/AdminJobsPage.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";
const COMPANY_HEADER_PATTERN = /Company/u;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const job: IAdminJob = {
  companyName: "Acme",
  id: "job-1",
  location: null,
  state: "failed",
  title: "Staff Engineer",
  url: "https://acme.test/jobs/1",
};

describe("AdminJobsPage", () => {
  it("renders failed jobs and retries one", async () => {
    const retried: string[] = [];
    server.use(
      http.get(`${API}/jobs/admin/failed`, () => envelope([job])),
      http.get(`${API}/jobs/admin/ai-status`, () =>
        envelope({ enabled: true, pausedUntil: null })
      ),
      http.post(`${API}/jobs/admin/:id/retry`, ({ params }) => {
        retried.push(String(params.id));
        return envelope(job);
      })
    );

    const { user } = render(<AdminJobsPage />, {
      route: "/admin/jobs?tab=failed",
    });

    expect(await screen.findByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("AI ready")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(retried).toEqual(["job-1"]);
    });
  });

  it("retries all failed jobs", async () => {
    const retried: string[] = [];
    server.use(
      http.get(`${API}/jobs/admin/failed`, () => envelope([job])),
      http.get(`${API}/jobs/admin/ai-status`, () =>
        envelope({ enabled: true, pausedUntil: null })
      ),
      http.post(`${API}/jobs/admin/retry-failed`, () => {
        retried.push("all");
        return envelope({ count: 1 });
      })
    );

    const { user } = render(<AdminJobsPage />, {
      route: "/admin/jobs?tab=failed",
    });
    await screen.findByText("Staff Engineer");

    await user.click(screen.getByRole("button", { name: "Retry all" }));

    await waitFor(() => {
      expect(retried).toEqual(["all"]);
    });
  });

  it("shows an empty state when there are no failed jobs", async () => {
    server.use(
      http.get(`${API}/jobs/admin/failed`, () => envelope([])),
      http.get(`${API}/jobs/admin/ai-status`, () =>
        envelope({ enabled: false, pausedUntil: null })
      )
    );

    render(<AdminJobsPage />, { route: "/admin/jobs?tab=failed" });

    expect(await screen.findByText("No failed jobs.")).toBeInTheDocument();
    expect(screen.getByText("AI disabled")).toBeInTheDocument();
  });
});

describe("AdminJobsPage all jobs", () => {
  const serveJobs = () => {
    const requests: URL[] = [];
    server.use(
      http.get(`${API}/jobs/admin`, ({ request }) => {
        requests.push(new URL(request.url));
        return envelope({
          items: [
            job,
            {
              ...job,
              createdAt: "2026-02-01T00:00:00.000Z",
              id: "job-2",
              missedCrawls: 3,
              provider: "greenhouse",
              state: "ok",
              stateChangedAt: "2026-02-02T00:00:00.000Z",
              title: "Product Engineer",
            },
          ],
          total: 45,
        });
      }),
      http.get(`${API}/jobs/admin/ai-status`, () =>
        envelope({ enabled: true, pausedUntil: null })
      )
    );
    return { lastRequest: () => requests.at(-1) };
  };

  it("renders jobs and round-trips filters, sorting, paging and reset", async () => {
    const { lastRequest } = serveJobs();

    const { user } = render(<AdminJobsPage />, { route: "/admin/jobs" });

    expect(await screen.findByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("Product Engineer")).toBeInTheDocument();
    expect(screen.getByText("greenhouse")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–20 of 45")).toBeInTheDocument();

    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("sort")).toBe("createdAt:desc");
      expect(lastRequest()?.searchParams.get("page")).toBe("1");
      expect(lastRequest()?.searchParams.get("limit")).toBe("20");
    });

    await user.type(
      screen.getByPlaceholderText("Search title or company"),
      "eng"
    );
    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("q")).toBe("eng");
      expect(lastRequest()?.searchParams.get("page")).toBe("1");
    });

    await user.click(screen.getByLabelText("State"));
    await user.click(await screen.findByRole("option", { name: "failed" }));
    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("state")).toBe("failed");
    });

    await user.click(screen.getByLabelText("Provider"));
    await user.click(await screen.findByRole("option", { name: "greenhouse" }));
    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("provider")).toBe("greenhouse");
    });

    await user.click(screen.getByRole("button", { name: "Title" }));
    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("sort")).toBe("title:asc");
      expect(lastRequest()?.searchParams.get("page")).toBe("1");
    });

    await user.click(screen.getByLabelText("Next page"));
    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("page")).toBe("2");
    });

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => {
      const params = lastRequest()?.searchParams;
      expect(params?.has("q")).toBe(false);
      expect(params?.has("state")).toBe(false);
      expect(params?.has("provider")).toBe(false);
      expect(params?.get("sort")).toBe("createdAt:desc");
      expect(params?.get("page")).toBe("1");
    });
  });

  it("hides a column from the View menu", async () => {
    serveJobs();

    const { user } = render(<AdminJobsPage />, { route: "/admin/jobs" });
    await screen.findByText("Staff Engineer");

    expect(
      screen.getByRole("columnheader", { name: COMPANY_HEADER_PATTERN })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View" }));
    await user.click(
      await screen.findByRole("menuitemcheckbox", { name: "companyName" })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("columnheader", { name: COMPANY_HEADER_PATTERN })
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
  });

  it("shows an empty state when no jobs match", async () => {
    server.use(
      http.get(`${API}/jobs/admin`, () => envelope({ items: [], total: 0 })),
      http.get(`${API}/jobs/admin/ai-status`, () =>
        envelope({ enabled: true, pausedUntil: null })
      )
    );

    render(<AdminJobsPage />, { route: "/admin/jobs" });

    expect(await screen.findByText("No jobs found.")).toBeInTheDocument();
  });
});

describe("AdminJobsPage failed job descriptions", () => {
  const serveDescription = () => {
    const saved: unknown[] = [];
    server.use(
      http.get(`${API}/jobs/admin/failed`, () => envelope([job])),
      http.get(`${API}/jobs/admin/ai-status`, () =>
        envelope({ enabled: true, pausedUntil: null })
      ),
      http.post(
        `${API}/jobs/admin/:id/description`,
        async ({ params, request }) => {
          saved.push({
            id: String(params.id),
            ...(await request.json()),
          });
          return envelope(job);
        }
      )
    );
    return { saved };
  };

  it("clears a cancelled draft and saves a new description", async () => {
    const { saved } = serveDescription();

    const { user } = render(<AdminJobsPage />, {
      route: "/admin/jobs?tab=failed",
    });
    await screen.findByText("Staff Engineer");

    await user.click(screen.getByRole("button", { name: "Paste description" }));
    let dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Description"), "draft text");
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Paste description" }));
    dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText("Description")).toHaveValue("");

    await user.type(
      within(dialog).getByLabelText("Description"),
      "Final description"
    );
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(saved).toEqual([
        { description: "Final description", id: "job-1" },
      ]);
    });
  });
});
