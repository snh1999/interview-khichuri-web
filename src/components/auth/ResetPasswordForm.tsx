import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { HOMEPAGE, RESET_PASSWORD_PAGE } from "@/app.constants.ts";
import { PasswordInput } from "@/components/common/form/PasswordInput.tsx";
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

  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = form.handleSubmit(async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(
        { newPassword: data.password, token },
        {
          onError: (error) => {
            navigate(`${RESET_PASSWORD_PAGE}?error=true`, { replace: true });
            toast.error(error.error.message || "Failed to update password");
          },
          onSuccess: () => {
            toast.success("Password reset successfully");
            navigate(HOMEPAGE);
          },
        }
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  });

  return { onSubmit, isSubmitting: form.formState.isSubmitting, form };
}

export const ResetPasswordForm = ({ token }: Readonly<{ token: string }>) => {
  const { form, isSubmitting, onSubmit } = useResetPasswordForm(token);

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
    </form>
  );
};
