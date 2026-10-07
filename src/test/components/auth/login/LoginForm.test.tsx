import { screen, waitFor } from "@testing-library/react";
import { useLocation } from "react-router";
import { describe, expect, it, type Mock, vi } from "vitest";
import { LoginForm } from "@/components/auth/login/LoginForm.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { signIn } from "@/lib/auth/auth-client.ts";
import { render } from "@/test/render.tsx";

vi.mock("@/lib/auth/auth-client", () => ({
  signIn: { email: vi.fn() },
}));

const LocationProbe = () => <p>{`path=${useLocation().pathname}`}</p>;

const typeCredentials = async (user: ReturnType<typeof render>["user"]) => {
  await user.type(screen.getByLabelText("Email"), "dev@example.com");
  await user.type(screen.getByLabelText("Password"), "secret123");
};

describe("LoginForm", () => {
  it("keeps submit disabled until the fields are valid", async () => {
    const { user } = render(<LoginForm />);

    expect(screen.getByRole("button", { name: "Log in" })).toBeDisabled();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(signIn.email).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");

    expect(screen.getByRole("button", { name: "Log in" })).toBeEnabled();
  });

  it("signs in with the entered credentials and navigates home", async () => {
    (signIn.email as Mock).mockImplementation(async (_payload, options) => {
      await options.onSuccess();
    });
    const { user } = render(
      <>
        <LoginForm />
        <Toaster />
        <LocationProbe />
      </>
    );
    await typeCredentials(user);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(signIn.email).toHaveBeenCalledWith(
        { email: "dev@example.com", password: "secret123" },
        expect.objectContaining({})
      );
    });
    expect(await screen.findByText("Welcome back!")).toBeInTheDocument();
    expect(await screen.findByText("path=/dashboard")).toBeInTheDocument();
  });

  it("sends an unverified user to the email-verification page", async () => {
    (signIn.email as Mock).mockImplementation(async (_payload, options) => {
      await options.onError({ error: { code: "EMAIL_NOT_VERIFIED" } });
    });
    const { user } = render(
      <>
        <LoginForm />
        <LocationProbe />
      </>
    );
    await typeCredentials(user);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("path=/email-redirect")).toBeInTheDocument();
  });

  it("shows the auth error message when sign-in fails", async () => {
    (signIn.email as Mock).mockImplementation(async (_payload, options) => {
      await options.onError({
        error: {
          code: "INVALID_EMAIL_OR_PASSWORD",
          message: "Invalid email or password",
        },
      });
    });
    const { user } = render(
      <>
        <LoginForm />
        <Toaster />
        <LocationProbe />
      </>
    );
    await typeCredentials(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText("Invalid email or password")
    ).toBeInTheDocument();
    expect(await screen.findByText("path=/")).toBeInTheDocument();
  });
});
