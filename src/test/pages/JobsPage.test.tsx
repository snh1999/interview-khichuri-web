import { fireEvent, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw/http";
import { useLocation } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import type { IJob, IJobWithTrack } from "@/api/jobs";
import { JobsPage } from "@/pages/JobsPage.tsx";
import { useJobsStore } from "@/store/useJobsStore.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const paste = (text: string, target: EventTarget = document.body) => {
  const event = new Event("paste", { bubbles: true });
  Object.defineProperty(event, "clipboardData", {
    value: { getData: () => text },
  });
  fireEvent(target, event);
};

const trackedJob: IJobWithTrack = {
  companyName: "Tracked Co",
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "My saved job",
  id: "tracked-1",
  title: "Saved Engineer",
  updatedAt: "2026-01-01T00:00:00.000Z",
  track: {
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "track-1",
    isFavorite: false,
    jobId: "tracked-1",
    status: "saved",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
};

const discoverJob: IJob = {
  companyId: 11,
  companyName: "Acme",
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "A discovered job",
  id: "discover-1",
  state: "ok",
  title: "Discovered Engineer",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const serve = () => {
  const tracked: string[] = [];
  server.use(
    http.get(`${API}/jobs`, () => envelope([trackedJob])),
    http.get(`${API}/jobs/discover`, () => envelope([discoverJob])),
    http.get(`${API}/company`, () => envelope([])),
    http.get(`${API}/lookups/roles`, () => envelope([])),
    http.get(`${API}/lookups/topics`, () => envelope([])),
    http.post(`${API}/jobs/:id/track`, ({ params }) => {
      tracked.push(String(params.id));
      return HttpResponse.json({
        data: discoverJob,
        message: "OK",
        statusCode: 201,
      });
    })
  );
  return { tracked };
};

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.search}</div>;
};

afterEach(() => {
  useJobsStore.setState({
    companyId: null,
    dateFrom: undefined,
    datePreset: undefined,
    dateTo: undefined,
    dateType: "all",
    search: "",
    status: undefined,
  });
});

describe("JobsPage", () => {
  it("loads a company deep link and keeps the company filter", async () => {
    const companyRequests: string[] = [];
    let discoverRequests = 0;
    server.use(
      http.get(`${API}/jobs`, () => envelope([trackedJob])),
      http.get(`${API}/jobs/discover`, () => {
        discoverRequests += 1;
        return envelope([discoverJob]);
      }),
      http.get(`${API}/company/11/jobs`, ({ request }) => {
        companyRequests.push(request.url);
        return envelope([discoverJob]);
      }),
      http.get(`${API}/company`, () => envelope([])),
      http.get(`${API}/lookups/roles`, () => envelope([])),
      http.get(`${API}/lookups/topics`, () => envelope([]))
    );

    render(
      <>
        <JobsPage />
        <LocationProbe />
      </>,
      { route: "/jobs?companyId=11&tab=discover" }
    );

    expect(await screen.findByText("Discovered Engineer")).toBeInTheDocument();
    expect(companyRequests).toHaveLength(1);
    expect(discoverRequests).toBe(0);
    expect(
      new URLSearchParams(screen.getByTestId("location").textContent ?? "").get(
        "companyId"
      )
    ).toBe("11");
  });

  it("switches to Discover and tracks a job", async () => {
    const { tracked } = serve();
    const { user } = render(<JobsPage />, { route: "/jobs" });

    expect(await screen.findByText("Saved Engineer")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Discover" }));
    expect(await screen.findByText("Discovered Engineer")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Track" }));

    await waitFor(() => {
      expect(tracked).toEqual(["discover-1"]);
    });
  });

  it("limits Discover sort options to keys that do not need a track", async () => {
    serve();
    const { user } = render(<JobsPage />, { route: "/jobs" });

    await screen.findByText("Saved Engineer");
    await user.click(screen.getByRole("tab", { name: "Discover" }));

    await user.click(screen.getByRole("button", { name: "Default" }));

    expect(
      await screen.findByRole("menuitemradio", { name: "Newest" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitemradio", { name: "Interview" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitemradio", { name: "Applied" })
    ).not.toBeInTheDocument();
  });

  it("pastes a URL into the source field and other text into the description", async () => {
    serve();
    const { user } = render(<JobsPage />, { route: "/jobs" });

    await screen.findByText("Saved Engineer");

    paste("https://example.com/job/1");
    expect(await screen.findByLabelText("Source URL")).toHaveValue(
      "https://example.com/job/1"
    );
    expect(screen.getByLabelText("Description")).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByLabelText("Source URL")).not.toBeInTheDocument();
    });

    paste("Paste me as a description");
    expect(await screen.findByLabelText("Description")).toHaveValue(
      "Paste me as a description"
    );
  });

  it("leaves paste alone when the target is an editable field", async () => {
    serve();
    render(<JobsPage />, { route: "/jobs" });

    const searchInput = await screen.findByPlaceholderText("Search jobs...");
    paste("https://example.com/job/1", searchInput);

    expect(screen.queryByLabelText("Source URL")).not.toBeInTheDocument();
  });
});
