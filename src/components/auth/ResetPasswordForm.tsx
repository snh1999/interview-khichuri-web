import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { HOMEPAGE } from "@/app.constants.ts";
import { PasswordInput } from "@/components/common/form/PasswordInput.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { resetPassword } from "@/lib/auth/auth-client.ts";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function useResetPasswordForm(token: string) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = form.handleSubmit(async (data: ResetPasswordFormData) => {
    setErrorMessage(null);
    setIsTokenInvalid(false);

    try {
      await resetPassword(
        { newPassword: data.password, token },
        {
          onError: (error) => {
            const code = error.error?.code;
            const message = error.error?.message || "Failed to update password";

            if (code === "INVALID_TOKEN") {
              setIsTokenInvalid(true);
            } else {
              setErrorMessage(message);
            }
          },
          onSuccess: () => {
            toast.success("Password reset successfully");
            navigate(HOMEPAGE);
          },
        }
      );
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    }
  });

  return {
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    form,
    errorMessage,
    isTokenInvalid,
  };
}

export const ResetPasswordForm = ({ token }: Readonly<{ token: string }>) => {
  const { form, isSubmitting, onSubmit, errorMessage, isTokenInvalid } =
    useResetPasswordForm(token);

  if (isTokenInvalid) {
    return (
      <Alert className="px-4 py-3 text-center">
        <AlertTitle className="pb-2 font-bold text-destructive text-lg">
          Link expired
        </AlertTitle>
        <AlertDescription className="space-y-3">
          This password reset link has expired or is no longer valid. Please
          request a new one.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <PasswordInput
        form={form}
        label="Password"
        name="password"
        showStrength
      />
      <PasswordInput
        form={form}
        label="Re-enter Password"
        name="confirmPassword"
      />

      <AsyncButton
        className="mt-2 w-full"
        isLoading={isSubmitting}
        size="lg"
        type="submit"
      >
        Update Password
      </AsyncButton>
      {errorMessage ? (
        <Alert className="border-destructive text-center" variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
};
