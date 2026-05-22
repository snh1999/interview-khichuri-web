import { z } from "zod";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEmailResendCooldown } from "@/hooks/useEmailResendCooldown.ts";
import { requestPasswordReset } from "@/lib/auth/auth-client.ts";
import {
  FORGOT_PASSWORD_EMAIL_CONTEXT,
  EMAIL_REDIRECT_PAGE,
  RESET_PASSWORD_PAGE,
} from "@/app.constants.ts";
import type {
  TFormHook,
  TFormProps,
} from "@/components/common/form/form.types.ts";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const useForgotPasswordForm = ({
  onSuccess,
}: TFormProps): TFormHook<ForgotPasswordFormData> & {
  cooldown: number;
} => {
  const navigate = useNavigate();
  const { cooldown, markSent } = useEmailResendCooldown();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data: ForgotPasswordFormData) => {
    try {
      await requestPasswordReset(
        {
          email: data.email,
          redirectTo: RESET_PASSWORD_PAGE,
        },
        {
          onError: (error) => {
            toast.error(error.error.message);
          },
          onSuccess: async () => {
            toast.success("Email Sent!");
            markSent();
            await navigate(EMAIL_REDIRECT_PAGE, {
              state: { context: FORGOT_PASSWORD_EMAIL_CONTEXT },
            });
            onSuccess?.();
          },
        }
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  });

  return { onSubmit, form, cooldown, isLoading: form.formState.isSubmitting };
};
