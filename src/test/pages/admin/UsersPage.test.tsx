import { screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { IAdminUser, IAdminUsersResponse } from "@/api/admin";
import { UsersPage } from "@/pages/admin/UsersPage.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const authMocks = vi.hoisted(() => ({
  listUserSessions: vi.fn(async () => ({
    data: {
      sessions: [
        {
          createdAt: "2026-06-15T12:00:00.000Z",
          expiresAt: "2026-07-15T12:00:00.000Z",
          id: "s1",
          impersonatedBy: "admin-1",
          ipAddress: "10.0.0.1",
          token: "tok",
          userAgent: "Firefox",
        },
      ],
    },
    error: null,
  })),
  revokeUserSession: vi.fn(async () => ({
    data: { success: true },
    error: null,
  })),
}));

vi.mock("@/lib/auth/auth-client", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/auth/auth-client.ts")>();
  return {
    ...actual,
    authAdmin: { ...actual.authAdmin, ...authMocks },
    unwrapBetterAuth: async (
      call: Promise<{ data: unknown; error: unknown }>
    ) => {
      const response = await call;
      if (response.error || !response.data) {
        throw new Error("failed");
      }
      return response.data;
    },
    useSession: () => ({ data: { user: { id: "current-user" } } }),
  };
});

const API = "*/api/v1";
const YEAR_PATTERN = /2026/u;
const USER_HEADER_PATTERN = /User/u;
const USERS_URL = `${API}/admin/users`;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const user: IAdminUser = {
  banExpires: null,
  banReason: null,
  banned: false,
  createdAt: "2026-06-15T12:00:00.000Z",
  email: "ada@example.com",
  emailVerified: true,
  id: "u1",
  image: null,
  name: "Ada Lovelace",
  role: "admin",
  updatedAt: "2026-06-15T12:00:00.000Z",
};

const serveUsers = (total: number) => {
  const requests: URL[] = [];
  server.use(
    http.get(USERS_URL, ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      return envelope({
        total,
        users: [user],
      } satisfies IAdminUsersResponse);
    })
  );
  return {
    lastRequest: () => requests.at(-1),
    requests,
  };
};

describe("UsersPage", () => {
  it("renders users with their role, verification, ban and created columns", async () => {
    serveUsers(1);

    render(<UsersPage />, { route: "/admin/users" });

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getAllByText("Verified")).toHaveLength(2);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getAllByText(YEAR_PATTERN).length).toBeGreaterThan(0);
  });

  it("turns toolbar changes into users query params and resets them", async () => {
    const { lastRequest } = serveUsers(1);

    const { user: userEvent } = render(<UsersPage />, {
      route: "/admin/users",
    });
    await screen.findByText("Ada Lovelace");

    await userEvent.type(
      screen.getByPlaceholderText("Search name or email"),
      "ada"
    );
    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("q")).toBe("ada");
    });
    expect(lastRequest()?.searchParams.get("page")).toBe("1");

    await userEvent.click(screen.getByLabelText("Role"));
    await userEvent.click(await screen.findByRole("option", { name: "Admin" }));
    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("role")).toBe("admin");
    });

    await userEvent.click(screen.getByLabelText("Banned"));
    await userEvent.click(await screen.findByRole("option", { name: "Yes" }));
    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("banned")).toBe("true");
    });

    await userEvent.click(screen.getByLabelText("Verified"));
    await userEvent.click(await screen.findByRole("option", { name: "No" }));
    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("verified")).toBe("false");
    });

    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => {
      const params = lastRequest()?.searchParams;
      expect(params?.has("q")).toBe(false);
      expect(params?.has("role")).toBe(false);
      expect(params?.has("banned")).toBe(false);
      expect(params?.has("verified")).toBe(false);
      expect(params?.get("page")).toBe("1");
    });
  });

  it("round-trips pagination and sorting through the URL", async () => {
    const { lastRequest } = serveUsers(25);

    const { user: userEvent } = render(<UsersPage />, {
      route: "/admin/users?page=2&limit=10&sort=name:asc",
    });

    await waitFor(() => {
      const params = lastRequest()?.searchParams;
      expect(params?.get("page")).toBe("2");
      expect(params?.get("limit")).toBe("10");
      expect(params?.get("sort")).toBe("name:asc");
    });

    const nameHeader = screen.getByRole("columnheader", {
      name: USER_HEADER_PATTERN,
    });
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");

    await userEvent.click(screen.getByRole("button", { name: "User" }));
    await waitFor(() => {
      const params = lastRequest()?.searchParams;
      expect(params?.get("sort")).toBe("name:desc");
      expect(params?.get("page")).toBe("1");
    });
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");

    await userEvent.click(screen.getByLabelText("Next page"));
    await waitFor(() => {
      const params = lastRequest()?.searchParams;
      expect(params?.get("page")).toBe("2");
      expect(params?.get("sort")).toBe("name:desc");
    });
  });

  it("shows a banned user with the unban action", async () => {
    server.use(
      http.get(USERS_URL, () =>
        envelope({ total: 1, users: [{ ...user, banned: true }] })
      )
    );

    const { user: userEvent } = render(<UsersPage />, {
      route: "/admin/users",
    });

    expect(
      await screen.findByRole("cell", { name: "Banned" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("User actions"));
    expect(
      await screen.findByRole("menuitem", { name: "Unban user" })
    ).toBeInTheDocument();
  });

  it("shows an empty state when no users match", async () => {
    server.use(http.get(USERS_URL, () => envelope({ total: 0, users: [] })));

    render(<UsersPage />, { route: "/admin/users" });

    expect(
      await screen.findByText("No users match these filters.")
    ).toBeInTheDocument();
  });

  it("shows an error state when the users request fails", async () => {
    server.use(
      http.get(USERS_URL, () => new HttpResponse(null, { status: 500 }))
    );

    render(<UsersPage />, { route: "/admin/users" });

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });
});

describe("UsersPage detail sheet", () => {
  const detail = {
    counts: {
      apiKeys: 1,
      calendarEvents: 2,
      interviews: 3,
      jobs: 4,
      notes: 5,
      prepSessions: 6,
      prompts: 7,
      resumes: 8,
    },
    passkeys: 2,
    profile: {
      country: "UK",
      firstName: "Ada",
      lastName: "Lovelace",
      location: "London",
    },
    providers: ["google", "github"],
    user,
  };

  const openDetails = async (userEvent: ReturnType<typeof render>["user"]) => {
    await screen.findByText("Ada Lovelace");
    await userEvent.click(screen.getByLabelText("User actions"));
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "View details" })
    );
  };

  it("renders a full profile and revokes a session", async () => {
    serveUsers(1);
    server.use(http.get(`${API}/admin/users/u1`, () => envelope(detail)));

    const { user: userEvent } = render(<UsersPage />, {
      route: "/admin/users",
    });
    await openDetails(userEvent);

    const sheet = await screen.findByRole("dialog");
    expect(await within(sheet).findByText("London")).toBeInTheDocument();
    expect(within(sheet).getByText("google")).toBeInTheDocument();
    expect(within(sheet).getByText("2 passkeys")).toBeInTheDocument();
    expect(within(sheet).getByText("Firefox")).toBeInTheDocument();
    expect(within(sheet).getByText("10.0.0.1")).toBeInTheDocument();
    expect(within(sheet).getByText("Impersonation")).toBeInTheDocument();

    await userEvent.click(
      within(sheet).getByRole("button", { name: "Revoke" })
    );
    await waitFor(() => {
      expect(authMocks.revokeUserSession).toHaveBeenCalledWith({
        sessionToken: "tok",
      });
    });
  });

  it("renders fallback values for a banned user without a profile", async () => {
    const bannedUser = {
      ...user,
      banExpires: "2026-12-31T00:00:00.000Z",
      banReason: "spam",
      banned: true,
      emailVerified: false,
      role: null,
    };
    serveUsers(1);
    server.use(
      http.get(`${API}/admin/users/u1`, () =>
        envelope({
          counts: detail.counts,
          passkeys: 1,
          profile: null,
          providers: [],
          user: bannedUser,
        })
      )
    );
    authMocks.listUserSessions.mockResolvedValueOnce({
      data: { sessions: [] },
      error: null,
    });

    const { user: userEvent } = render(<UsersPage />, {
      route: "/admin/users",
    });
    await openDetails(userEvent);

    const sheet = await screen.findByRole("dialog");
    expect(await within(sheet).findByText("spam")).toBeInTheDocument();
    expect(within(sheet).getByText("No profile set up.")).toBeInTheDocument();
    expect(within(sheet).getByText("No linked providers.")).toBeInTheDocument();
    expect(within(sheet).getByText("1 passkey")).toBeInTheDocument();
    expect(within(sheet).getByText("No active sessions.")).toBeInTheDocument();
    expect(within(sheet).getByText("Unverified")).toBeInTheDocument();
  });
});
