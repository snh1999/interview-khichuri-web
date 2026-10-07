import { screen } from "@testing-library/react";
import { useLocation } from "react-router";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { requestPasswordReset } from "@/lib/auth/auth-client.ts";
import { useResendStore } from "@/store/resendStore.ts";
import { render } from "@/test/render.tsx";

vi.mock("@/lib/auth/auth-client", () => ({
  requestPasswordReset: vi.fn(),
}));

const LocationProbe = () => <p>{`path=${useLocation().pathname}`}</p>;

const SEND_LINK = /Send Link/;

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useResendStore.setState(useResendStore.getInitialState(), true);
  });

  it("keeps Send Link disabled until a valid email is typed", async () => {
    const { user } = render(<ForgotPasswordForm />);

    expect(screen.getByRole("button", { name: SEND_LINK })).toBeDisabled();

    await user.type(screen.getByLabelText("Email"), "not-an-email");

    expect(screen.getByRole("button", { name: SEND_LINK })).toBeDisabled();

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "dev@example.com");

    expect(screen.getByRole("button", { name: SEND_LINK })).toBeEnabled();
  });

  it("sends the reset link and goes to the email-redirect page", async () => {
    (requestPasswordReset as Mock).mockImplementation(
      async (_payload, options) => {
        await options.onSuccess();
      }
    );
    const { user } = render(
      <>
        <ForgotPasswordForm />
        <Toaster />
        <LocationProbe />
      </>
    );
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.click(screen.getByRole("button", { name: SEND_LINK }));

    expect(requestPasswordReset).toHaveBeenCalledWith(
      { email: "dev@example.com", redirectTo: "/reset-password" },
      expect.objectContaining({})
    );
    expect(await screen.findByText("Reset link sent")).toBeInTheDocument();
    expect(await screen.findByText("path=/email-redirect")).toBeInTheDocument();
  });

  it("surfaces the auth error message when the reset fails", async () => {
    (requestPasswordReset as Mock).mockImplementation(
      async (_payload, options) => {
        await options.onError({
          error: {
            code: "USER_NOT_FOUND",
            message: "No account found for that email",
          },
        });
      }
    );
    const { user } = render(
      <>
        <ForgotPasswordForm />
        <Toaster />
      </>
    );
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.click(screen.getByRole("button", { name: SEND_LINK }));

    expect(
      await screen.findByText("No account found for that email")
    ).toBeInTheDocument();
  });
});
