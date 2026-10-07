import { screen } from "@testing-library/react";
import { useLocation } from "react-router";
import { describe, expect, it, type Mock, vi } from "vitest";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { resetPassword } from "@/lib/auth/auth-client.ts";
import { render } from "@/test/render.tsx";

vi.mock("@/lib/auth/auth-client", () => ({
  resetPassword: vi.fn(),
}));

const LocationProbe = () => <p>{`path=${useLocation().pathname}`}</p>;

const EXPIRED_LINK = /has expired or is no longer valid/;

const fillPasswords = async (
  user: ReturnType<typeof render>["user"],
  password: string,
  confirmPassword: string
) => {
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Re-enter Password"), confirmPassword);
};

describe("ResetPasswordForm", () => {
  it("shows validation errors when submitted empty", async () => {
    const { user } = render(<ResetPasswordForm token="tok-1" />);

    await user.click(screen.getByRole("button", { name: "Update Password" }));

    expect(
      await screen.findByText("Password must be at least 8 characters")
    ).toBeInTheDocument();
  });

  it("rejects mismatched passwords", async () => {
    const { user } = render(<ResetPasswordForm token="tok-1" />);
    await fillPasswords(user, "longenough123", "different123");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("resets the password and navigates home", async () => {
    (resetPassword as unknown as Mock).mockImplementation(
      async (_payload, options) => {
        await options.onSuccess();
      }
    );
    const { user } = render(
      <>
        <ResetPasswordForm token="tok-1" />
        <Toaster />
        <LocationProbe />
      </>
    );
    await fillPasswords(user, "newpassword1", "newpassword1");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    expect(resetPassword).toHaveBeenCalledWith(
      { newPassword: "newpassword1", token: "tok-1" },
      expect.objectContaining({})
    );
    expect(
      await screen.findByText("Password reset successfully")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("path=/dashboard", {}, { timeout: 3000 })
    ).toBeInTheDocument();
  });

  it("shows the expired-link alert for an invalid token", async () => {
    (resetPassword as unknown as Mock).mockImplementation(
      async (_payload, options) => {
        await options.onError({
          error: { code: "INVALID_TOKEN", message: "Token invalid" },
        });
      }
    );
    const { user } = render(<ResetPasswordForm token="tok-old" />);
    await fillPasswords(user, "newpassword1", "newpassword1");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    expect(await screen.findByText("Link expired")).toBeInTheDocument();
    expect(screen.getByText(EXPIRED_LINK)).toBeInTheDocument();
  });

  it("shows the server error message for other failures", async () => {
    (resetPassword as unknown as Mock).mockImplementation(
      async (_payload, options) => {
        await options.onError({
          error: { code: "INTERNAL", message: "Something went wrong" },
        });
      }
    );
    const { user } = render(<ResetPasswordForm token="tok-1" />);
    await fillPasswords(user, "newpassword1", "newpassword1");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });
});
