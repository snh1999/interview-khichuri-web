import { screen, waitFor } from "@testing-library/react";
import type { User } from "better-auth";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { UpdateProfileForm } from "@/components/settings/update/UpdateProfileForm.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { changeEmail, updateUser } from "@/lib/auth/auth-client.ts";
import { render } from "@/test/render.tsx";

vi.mock("@/lib/auth/auth-client", () => ({
  changeEmail: vi.fn(),
  updateUser: vi.fn(),
}));

const createdAt = new Date("2026-01-01T00:00:00.000Z");
const user: User = {
  createdAt,
  email: "dev@example.com",
  emailVerified: true,
  id: "user-1",
  name: "Jane Doe",
  updatedAt: createdAt,
};

describe("UpdateProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the buttons disabled until the form is dirty", async () => {
    const { user: actor } = render(<UpdateProfileForm user={user} />);

    expect(screen.getByRole("button", { name: "Update" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();

    await actor.type(screen.getByLabelText("Name"), "x");

    expect(screen.getByRole("button", { name: "Update" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled();
  });

  it("resets the form back to the stored profile", async () => {
    const { user: actor } = render(<UpdateProfileForm user={user} />);
    await actor.clear(screen.getByLabelText("Name"));
    await actor.type(screen.getByLabelText("Name"), "Changed temporary");
    await actor.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText<HTMLInputElement>("Name").value).toBe(
      "Jane Doe"
    );
  });

  it("updates the name through the auth client", async () => {
    (updateUser as Mock).mockImplementation(async (_payload, options) => {
      await options.onSuccess();
    });
    const { user: actor } = render(
      <>
        <UpdateProfileForm user={user} />
        <Toaster />
      </>
    );
    await actor.clear(screen.getByLabelText("Name"));
    await actor.type(screen.getByLabelText("Name"), "Janet Doe");
    await actor.click(screen.getByRole("button", { name: "Update" }));

    expect(updateUser).toHaveBeenCalledWith(
      { name: "Janet Doe" },
      expect.objectContaining({})
    );
    expect(await screen.findByText("Profile updated")).toBeInTheDocument();
  });

  it("asks for email verification when the email changes", async () => {
    (changeEmail as Mock).mockImplementation(async (_payload, options) => {
      await options.onSuccess();
    });
    const { user: actor } = render(
      <>
        <UpdateProfileForm user={user} />
        <Toaster />
      </>
    );
    await actor.clear(screen.getByLabelText("Email"));
    await actor.type(screen.getByLabelText("Email"), "new@example.com");
    await actor.click(screen.getByRole("button", { name: "Update" }));

    expect(changeEmail).toHaveBeenCalledWith(
      { newEmail: "new@example.com" },
      expect.objectContaining({})
    );
    expect(
      await screen.findByText(
        "Verify your new email address to complete the change."
      )
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(updateUser).not.toHaveBeenCalled();
    });
  });
});
