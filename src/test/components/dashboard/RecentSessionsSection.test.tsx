import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { IPrepSession } from "@/api/sessions";
import { RecentSessionsSection } from "@/components/dashboard/RecentSessionsSection.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const makeSession = (
  id: string,
  createdAt: string,
  description = ""
): IPrepSession => ({
  id,
  title: `Session ${id}`,
  description,
  topicIds: [],
  createdAt,
  updatedAt: createdAt,
  jobId: null,
  isFavorite: false,
  experience: null,
});

const SESSION_TITLE = /^Session /;

const useSessionsResponse = (sessions: IPrepSession[]) =>
  server.use(
    http.get("*/api/v1/prep-session", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: sessions })
    ),
    http.get("*/api/v1/lookups/topics", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: [] })
    ),
    http.get("*/api/v1/lookups/roles", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: [] })
    ),
    http.get("*/api/v1/jobs", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: [] })
    )
  );

describe("RecentSessionsSection", () => {
  it("renders no sessions message", async () => {
    useSessionsResponse([]);
    const view = render(<RecentSessionsSection />);
    expect(
      await view.findByText("No sessions yet — create your first one.")
    ).toBeInTheDocument();
  });

  it("shows the four most recent sessions sorted by createdAt desc", async () => {
    useSessionsResponse([
      makeSession("old", "2026-01-05T00:00:00.000Z", "Old topic"),
      makeSession("mid", "2026-01-10T00:00:00.000Z", "Mid topic"),
      makeSession("new-a", "2026-01-15T00:00:00.000Z", "New A topic"),
      makeSession("new-b", "2026-01-20T00:00:00.000Z", "New B topic"),
      makeSession("oldest", "2026-01-01T00:00:00.000Z", "Oldest topic"),
    ]);
    const view = render(<RecentSessionsSection />);
    const list = await view.findByText("Session new-b");
    expect(list).toBeInTheDocument();
    expect(screen.getByText("Session new-a")).toBeInTheDocument();
    expect(screen.getByText("Session mid")).toBeInTheDocument();
    expect(screen.getByText("Session old")).toBeInTheDocument();
    expect(screen.queryByText("Session oldest")).not.toBeInTheDocument();

    const rows = Array.from(
      screen.getAllByText(SESSION_TITLE).map((n) => n.textContent)
    );
    expect(rows).toEqual([
      "Session new-b",
      "Session new-a",
      "Session mid",
      "Session old",
    ]);
  });

  it("links to the sessions page", async () => {
    useSessionsResponse([makeSession("s1", "2026-01-05T00:00:00.000Z")]);
    const view = render(<RecentSessionsSection />);
    await view.findByText("Session s1");
    expect(screen.getByRole("button", { name: "View" })).toHaveAttribute(
      "href",
      "/sessions"
    );
  });

  it("opens the new session dialog", async () => {
    useSessionsResponse([]);
    const view = render(<RecentSessionsSection />);
    await view.findByText("No sessions yet — create your first one.");
    await view.user.click(screen.getByRole("button", { name: "New session" }));
    expect(
      await view.findByText("New Preparation Session")
    ).toBeInTheDocument();
  });
});
