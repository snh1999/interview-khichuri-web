import { screen } from "@testing-library/react";
import { useLocation } from "react-router";
import { describe, expect, it, type Mock, vi } from "vitest";
import { RegisterForm } from "@/components/auth/register/RegisterForm.tsx";
import { signUp } from "@/lib/auth/auth-client.ts";
import { render } from "@/test/render.tsx";

vi.mock("@/lib/auth/auth-client", () => ({
  signUp: { email: vi.fn() },
}));

const LocationProbe = () => <p>{`path=${useLocation().pathname}`}</p>;

const fillRegistration = async (
  user: ReturnType<typeof render>["user"],
  overrides: Partial<
    Record<"name" | "email" | "password" | "confirmPassword", string>
  > = {}
) => {
  const values = {
    name: "Jane Doe",
    email: "dev@example.com",
    password: "longpassword",
    confirmPassword: "longpassword",
    ...overrides,
  };
  await user.type(screen.getByLabelText("Full Name"), values.name);
  await user.type(screen.getByLabelText("Email"), values.email);
  await user.type(screen.getByLabelText("Password"), values.password);
  await user.type(
    screen.getByLabelText("Re-enter Password"),
    values.confirmPassword
  );
  return values;
};

describe("RegisterForm", () => {
  it("shows validation errors when submitted empty", async () => {
    const { user } = render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByText("Name must be at least 2 characters")
    ).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters")
    ).toBeInTheDocument();
  });

  it("rejects mismatched passwords", async () => {
    const { user } = render(<RegisterForm />);

    await fillRegistration(user, {
      password: "longpassword-one",
      confirmPassword: "a-different-password",
    });
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
    expect(signUp.email).not.toHaveBeenCalled();
  });

  it("creates the account and sends the user to verify their email", async () => {
    (signUp.email as Mock).mockImplementation(async (_payload, options) => {
      await options.onSuccess();
    });
    const { user } = render(
      <>
        <RegisterForm />
        <LocationProbe />
      </>
    );

    await fillRegistration(user);
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(signUp.email).toHaveBeenCalledWith(
      {
        name: "Jane Doe",
        email: "dev@example.com",
        password: "longpassword",
        confirmPassword: "longpassword",
      },
      expect.objectContaining({})
    );
    expect(await screen.findByText("path=/email-redirect")).toBeInTheDocument();
  });
});
