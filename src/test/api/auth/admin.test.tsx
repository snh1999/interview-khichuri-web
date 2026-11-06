import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "@/api";
import { parseAdminUsersQuery, useAdminUsersQueryParams } from "@/api/admin";
import {
  useAdminUserSessions,
  useBanUser,
  useGetPermission,
  useImpersonateUser,
  useRemoveUser,
  useRevokeSessionByAdmin,
  useRevokeUserSession,
  useSetUserPassword,
  useSetUserRole,
  useUnbanUser,
  useVerifyUserEmail,
} from "@/api/auth/admin.ts";

const mocks = vi.hoisted(() => ({
  banUser: vi.fn(async () => ({ data: { user: {} }, error: null })),
  hasPermission: vi.fn(async () => ({ data: { success: true }, error: null })),
  impersonateUser: vi.fn(async () => ({ data: { user: {} }, error: null })),
  listUserSessions: vi.fn(async () => ({
    data: { sessions: [] },
    error: null,
  })),
  refetch: vi.fn(async () => ({ data: {} })),
  removeUser: vi.fn(async () => ({ data: { success: true }, error: null })),
  revokeUserSession: vi.fn(async () => ({
    data: { success: true },
    error: null,
  })),
  revokeUserSessions: vi.fn(async () => ({
    data: { success: true },
    error: null,
  })),
  setRole: vi.fn(async () => ({ data: { user: {} }, error: null })),
  setUserPassword: vi.fn(async () => ({
    data: { success: true },
    error: null,
  })),
  unbanUser: vi.fn(async () => ({ data: { user: {} }, error: null })),
  updateUser: vi.fn(async () => ({ data: { user: {} }, error: null })),
}));

vi.mock("@/lib/auth/auth-client", () => ({
  authAdmin: mocks,
  unwrapBetterAuth: async (
    call: Promise<{ data: unknown; error: unknown }>
  ) => {
    const response = await call;
    if (response.error || !response.data) {
      throw new Error("failed");
    }
    return response.data;
  },
  useSession: () => ({ refetch: mocks.refetch }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const activeFilters = {
  banned: true,
  limit: 10,
  page: 2,
  q: "ada",
  role: "admin",
  sort: "name:asc",
  verified: false,
};

const query = new URLSearchParams(
  "page=2&limit=10&sort=name:asc&q=ada&role=admin&banned=true&verified=false"
);

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[`/admin/users?${query}`]}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
  return { client, wrapper };
};

const resolvedKeys = (client: QueryClient, variables: unknown): unknown[] => {
  const invalidates = client.getMutationCache().getAll()[0]?.options.meta
    ?.invalidates as ((value: unknown) => unknown[]) | undefined;
  return invalidates?.(variables) ?? [];
};

describe("admin user mutation invalidation", () => {
  it("parses active filters from the users URL", () => {
    expect(parseAdminUsersQuery(query)).toEqual(activeFilters);
    expect(parseAdminUsersQuery(new URLSearchParams())).toEqual({
      banned: undefined,
      limit: 20,
      page: 1,
      q: undefined,
      role: undefined,
      sort: "createdAt:desc",
      verified: undefined,
    });
  });

  it("invalidates the active users query and the user detail", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(
      () => {
        useAdminUsersQueryParams();
        return useBanUser();
      },
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync({ userId: "u1", banReason: "spam" });
    });

    const keys = resolvedKeys(client, { userId: "u1", banReason: "spam" });
    expect(keys).toContainEqual(
      queryKeys.admin.users(activeFilters as Record<string, unknown>)
    );
    expect(keys).toContainEqual(queryKeys.admin.user("u1"));
  });

  it("invalidates the session list for a single-session revoke", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(
      () => {
        useAdminUsersQueryParams();
        return useRevokeUserSession();
      },
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync({
        sessionToken: "token",
        userId: "u1",
      });
    });

    const keys = resolvedKeys(client, {
      sessionToken: "token",
      userId: "u1",
    });
    expect(keys).toContainEqual(
      queryKeys.admin.users(activeFilters as Record<string, unknown>)
    );
    expect(keys).toContainEqual(queryKeys.admin.user("u1"));
    expect(keys).toContainEqual(queryKeys.admin.sessions({ userId: "u1" }));
  });

  it("invalidates active filters for role changes", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(
      () => {
        useAdminUsersQueryParams();
        return useSetUserRole();
      },
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync({ role: "admin", userId: "u1" });
    });

    const keys = resolvedKeys(client, { role: "admin", userId: "u1" });
    expect(keys).toContainEqual(
      queryKeys.admin.users(activeFilters as Record<string, unknown>)
    );
    expect(keys).toContainEqual(queryKeys.admin.user("u1"));
  });
});

describe("remaining admin hooks", () => {
  it("loads permissions and user sessions", async () => {
    const { wrapper } = createWrapper();

    const permission = renderHook(
      () => useGetPermission({ permissions: { user: ["list"] } }),
      { wrapper }
    );
    await waitFor(() => {
      expect(permission.result.current.data).toEqual({ success: true });
    });

    const sessions = renderHook(() => useAdminUserSessions("u1"), { wrapper });
    await waitFor(() => {
      expect(sessions.result.current.data).toEqual({ sessions: [] });
    });
    expect(mocks.listUserSessions).toHaveBeenCalledWith({ userId: "u1" });
  });

  it("impersonates a user and covers success and error branches", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(() => useImpersonateUser(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("u1");
    });
    expect(mocks.impersonateUser).toHaveBeenCalledWith({ userId: "u1" });
    expect(mocks.refetch).toHaveBeenCalled();
    expect(resolvedKeys(client, "u1")).toContainEqual(
      queryKeys.admin.user("u1")
    );

    mocks.impersonateUser.mockRejectedValueOnce("plain");
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toBeTruthy();
    });
  });

  it("unbans a user and covers success and error branches", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(() => useUnbanUser(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("u1");
    });
    expect(mocks.unbanUser).toHaveBeenCalledWith({ userId: "u1" });
    expect(resolvedKeys(client, "u1")).toContainEqual(
      queryKeys.admin.user("u1")
    );

    mocks.unbanUser.mockResolvedValueOnce({
      data: null,
      error: { message: "boom" },
    });
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toThrow("boom");
    });

    mocks.unbanUser.mockResolvedValueOnce({ data: null, error: {} });
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toThrow(
        "Failed to unban user"
      );
    });

    mocks.unbanUser.mockRejectedValueOnce("plain");
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toBeTruthy();
    });
  });

  it("removes a user and covers success and error branches", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(() => useRemoveUser(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("u1");
    });
    expect(mocks.removeUser).toHaveBeenCalledWith({ userId: "u1" });
    expect(resolvedKeys(client, "u1")).toContainEqual(
      queryKeys.admin.user("u1")
    );

    mocks.removeUser.mockResolvedValueOnce({
      data: null,
      error: { message: "boom" },
    });
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toThrow("boom");
    });

    mocks.removeUser.mockResolvedValueOnce({ data: null, error: {} });
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toThrow(
        "Failed to delete user"
      );
    });

    mocks.removeUser.mockRejectedValueOnce("plain");
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toBeTruthy();
    });
  });

  it("revokes all sessions and covers success and error branches", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(() => useRevokeSessionByAdmin(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("u1");
    });
    expect(mocks.revokeUserSessions).toHaveBeenCalledWith({ userId: "u1" });
    const keys = resolvedKeys(client, "u1");
    expect(keys).toContainEqual(queryKeys.admin.user("u1"));
    expect(keys).toContainEqual(queryKeys.admin.sessions({ userId: "u1" }));

    mocks.revokeUserSessions.mockResolvedValueOnce({
      data: null,
      error: { message: "boom" },
    });
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toThrow("boom");
    });

    mocks.revokeUserSessions.mockResolvedValueOnce({ data: null, error: {} });
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toThrow(
        "Failed to revoke sessions"
      );
    });

    mocks.revokeUserSessions.mockRejectedValueOnce("plain");
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toBeTruthy();
    });
  });

  it("sets a password and covers success and error branches", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(() => useSetUserPassword(), { wrapper });
    const variables = { newPassword: "secret", userId: "u1" };

    await act(async () => {
      await result.current.mutateAsync(variables);
    });
    expect(mocks.setUserPassword).toHaveBeenCalledWith(variables);
    expect(resolvedKeys(client, variables)).toContainEqual(
      queryKeys.admin.user("u1")
    );

    mocks.setUserPassword.mockResolvedValueOnce({
      data: null,
      error: { message: "boom" },
    });
    await act(async () => {
      await expect(result.current.mutateAsync(variables)).rejects.toThrow(
        "boom"
      );
    });

    mocks.setUserPassword.mockResolvedValueOnce({ data: null, error: {} });
    await act(async () => {
      await expect(result.current.mutateAsync(variables)).rejects.toThrow(
        "Failed to set password"
      );
    });

    mocks.setUserPassword.mockRejectedValueOnce("plain");
    await act(async () => {
      await expect(result.current.mutateAsync(variables)).rejects.toBeTruthy();
    });
  });

  it("verifies an email and covers success and error branches", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(() => useVerifyUserEmail(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("u1");
    });
    expect(mocks.updateUser).toHaveBeenCalledWith({
      data: { emailVerified: true },
      userId: "u1",
    });
    expect(resolvedKeys(client, "u1")).toContainEqual(
      queryKeys.admin.user("u1")
    );

    mocks.updateUser.mockResolvedValueOnce({
      data: null,
      error: { message: "boom" },
    });
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toThrow("boom");
    });

    mocks.updateUser.mockResolvedValueOnce({ data: null, error: {} });
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toThrow(
        "Failed to verify email"
      );
    });

    mocks.updateUser.mockRejectedValueOnce("plain");
    await act(async () => {
      await expect(result.current.mutateAsync("u1")).rejects.toBeTruthy();
    });
  });
});
