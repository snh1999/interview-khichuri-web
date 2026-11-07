import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { IAdminUser } from "@/api/admin";
import { UserActions } from "@/components/admin/UserActions.tsx";
import { render } from "@/test/render.tsx";

const mocks = vi.hoisted(() => ({
  ban: vi.fn(),
  impersonate: vi.fn(),
  remove: vi.fn(),
  revokeAll: vi.fn(),
  setPassword: vi.fn(),
  setRole: vi.fn(),
  unban: vi.fn(),
  verify: vi.fn(),
}));

const asAsync =
  (fn: (...args: never[]) => unknown) =>
  (...args: never[]) => {
    fn(...args);
    return Promise.resolve();
  };

vi.mock("@/api/auth/admin.ts", () => ({
  useBanUser: () => ({ isPending: false, mutate: mocks.ban }),
  useImpersonateUser: () => ({
    isPending: false,
    mutate: mocks.impersonate,
    mutateAsync: asAsync(mocks.impersonate),
  }),
  useRemoveUser: () => ({ isPending: false, mutate: mocks.remove }),
  useRevokeSessionByAdmin: () => ({
    isPending: false,
    mutate: mocks.revokeAll,
    mutateAsync: asAsync(mocks.revokeAll),
  }),
  useSetUserPassword: () => ({ isPending: false, mutate: mocks.setPassword }),
  useSetUserRole: () => ({
    isPending: false,
    mutate: mocks.setRole,
    mutateAsync: asAsync(mocks.setRole),
  }),
  useUnbanUser: () => ({ isPending: false, mutate: mocks.unban }),
  useVerifyUserEmail: () => ({ isPending: false, mutate: mocks.verify }),
}));

const user: IAdminUser = {
  banExpires: null,
  banReason: null,
  banned: false,
  createdAt: "2026-06-15T12:00:00.000Z",
  email: "ada@example.com",
  emailVerified: false,
  id: "u1",
  image: null,
  name: "Ada Lovelace",
  role: "user",
  updatedAt: "2026-06-15T12:00:00.000Z",
};

const setup = (isSelf = false) => {
  const onViewDetails = vi.fn();
  const view = render(
    <UserActions isSelf={isSelf} onViewDetails={onViewDetails} user={user} />
  );
  return { ...view, onViewDetails };
};

const openMenu = async (userEvent: ReturnType<typeof setup>["user"]) => {
  await userEvent.click(screen.getByRole("button", { name: "User actions" }));
  await screen.findByRole("menuitem", { name: "View details" });
};

describe("UserActions", () => {
  it("hides self-destructive actions for the current user", async () => {
    const { user: userEvent, onViewDetails } = setup(true);
    await openMenu(userEvent);

    expect(
      screen.queryByRole("menuitem", { name: "Impersonate" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Revoke sessions" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Ban user" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Delete user" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "View details" })
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("menuitem", { name: "View details" })
    );
    expect(onViewDetails).toHaveBeenCalledOnce();
  });

  it("confirms impersonate, revoke and role changes, then verifies email", async () => {
    const { user: userEvent } = setup();
    await openMenu(userEvent);

    await userEvent.click(
      screen.getByRole("menuitem", { name: "Impersonate" })
    );
    const impersonateDialog = await screen.findByRole("alertdialog");
    await userEvent.click(
      within(impersonateDialog).getByRole("button", { name: "Impersonate" })
    );
    await waitFor(() => {
      expect(mocks.impersonate).toHaveBeenCalledWith("u1");
    });

    await openMenu(userEvent);
    await userEvent.click(
      screen.getByRole("menuitem", { name: "Revoke sessions" })
    );
    const revokeDialog = await screen.findByRole("alertdialog");
    await userEvent.click(
      within(revokeDialog).getByRole("button", { name: "Revoke" })
    );
    await waitFor(() => {
      expect(mocks.revokeAll).toHaveBeenCalledWith("u1");
    });

    await openMenu(userEvent);
    await userEvent.click(screen.getByRole("menuitem", { name: "Make admin" }));
    const roleDialog = await screen.findByRole("alertdialog");
    await userEvent.click(
      within(roleDialog).getByRole("button", { name: "Make admin" })
    );
    await waitFor(() => {
      expect(mocks.setRole).toHaveBeenCalledWith({
        role: "admin",
        userId: "u1",
      });
    });

    await openMenu(userEvent);
    await userEvent.click(
      screen.getByRole("menuitem", { name: "Verify email" })
    );
    expect(mocks.verify).toHaveBeenCalledWith("u1");
  });

  it("bans with a reason and optional expiry", async () => {
    const { user: userEvent } = setup();
    await openMenu(userEvent);

    await userEvent.click(screen.getByRole("menuitem", { name: "Ban user" }));
    await userEvent.type(
      screen.getByLabelText("Reason"),
      "Spamming interviews"
    );
    await userEvent.type(
      screen.getByLabelText("Expires in days (optional)"),
      "2"
    );
    await userEvent.click(screen.getByRole("button", { name: "Ban user" }));

    await waitFor(() => {
      expect(mocks.ban).toHaveBeenCalledWith(
        {
          banExpiresIn: 172_800,
          banReason: "Spamming interviews",
          userId: "u1",
        },
        expect.anything()
      );
    });
  });

  it("sets a password", async () => {
    const { user: userEvent } = setup();
    await openMenu(userEvent);

    await userEvent.click(
      screen.getByRole("menuitem", { name: "Set password" })
    );
    await userEvent.type(screen.getByLabelText("New password"), "supersecret");
    await userEvent.click(screen.getByRole("button", { name: "Set password" }));

    await waitFor(() => {
      expect(mocks.setPassword).toHaveBeenCalledWith(
        { newPassword: "supersecret", userId: "u1" },
        expect.anything()
      );
    });
  });

  it("deletes after confirmation", async () => {
    const { user: userEvent } = setup();
    await openMenu(userEvent);

    await userEvent.click(screen.getByRole("button", { name: "Delete user" }));
    expect(await screen.findByText("Delete this user?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(mocks.remove).toHaveBeenCalledWith("u1");
  });
});
