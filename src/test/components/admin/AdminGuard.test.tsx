import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import type { Mock } from "vitest";
import { describe, expect, it, vi } from "vitest";
import { HOMEPAGE } from "@/app.constants.ts";
import { AdminGuard } from "@/components/admin/AdminGuard.tsx";
import { authAdmin } from "@/lib/auth/auth-client.ts";
import { render } from "@/test/render.tsx";

vi.mock("@/lib/auth/auth-client", () => ({
  authAdmin: { hasPermission: vi.fn() },
  unwrapBetterAuth: async (
    call: Promise<{ data: unknown; error: unknown }>
  ) => {
    const response = await call;
    if (response.error || !response.data) {
      throw new Error("no access");
    }
    return response.data;
  },
}));

const adminClient = authAdmin as unknown as { hasPermission: Mock };

const renderGuard = () =>
  render(
    <Routes>
      <Route element={<AdminGuard />} path="/admin">
        <Route element={<p>Admin content</p>} index />
      </Route>
      <Route element={<p>Dashboard</p>} path={HOMEPAGE} />
    </Routes>,
    { route: "/admin" }
  );

describe("AdminGuard", () => {
  it("redirects non-admins to the dashboard", async () => {
    adminClient.hasPermission.mockResolvedValue({
      data: { success: false },
      error: null,
    });

    const view = renderGuard();

    expect(await view.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("renders the guarded content for admins", async () => {
    adminClient.hasPermission.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    const view = renderGuard();

    expect(await view.findByText("Admin content")).toBeInTheDocument();
  });
});
