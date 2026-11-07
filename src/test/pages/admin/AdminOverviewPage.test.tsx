import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { IAdminStats, IAdminUsersResponse } from "@/api/admin";
import { AdminOverviewPage } from "@/pages/admin/AdminOverviewPage.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";
const SIGNUPS_SUMMARY_PATTERN = /Signups for the last 1 days: 2 total/u;
const USAGE_SUMMARY_PATTERN = /Usage records: .*Jobs 1/u;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const stats: IAdminStats = {
  users: {
    activeSessions: 11,
    banned: 3,
    new7d: 7,
    new30d: 20,
    total: 42,
    verified: 30,
  },
  usage: {
    apiKeys: 7,
    calendarEvents: 9,
    companies: 8,
    interviews: 3,
    jobs: 1,
    notes: 5,
    prepSessions: 2,
    prompts: 6,
    resumes: 4,
  },
  signups: [{ count: 2, date: "2026-10-22" }],
};

const users: IAdminUsersResponse = {
  total: 1,
  users: [
    {
      banExpires: null,
      banReason: null,
      banned: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      email: "ada@example.com",
      emailVerified: true,
      id: "u1",
      image: null,
      name: "Ada Lovelace",
      role: "admin",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

describe("AdminOverviewPage", () => {
  it("renders stat values and recent users from the API", async () => {
    server.use(
      http.get(`${API}/admin/stats`, () => envelope(stats)),
      http.get(`${API}/admin/users`, () => envelope(users)),
      http.get(`${API}/health`, () =>
        envelope({
          checks: {},
          message: "ok",
          status: "healthy",
          timestamp: "2026-10-22T00:00:00.000Z",
        })
      )
    );

    const view = render(<AdminOverviewPage />);

    expect(await view.findByText("42")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText(SIGNUPS_SUMMARY_PATTERN)).toBeInTheDocument();
    expect(screen.getByText(USAGE_SUMMARY_PATTERN)).toBeInTheDocument();
  });
});
