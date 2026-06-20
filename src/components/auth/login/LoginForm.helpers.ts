import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { EMAIL_REDIRECT_PAGE, HOMEPAGE } from "@/app.constants.ts";
import type {
  IFormHook,
  IFormProps,
} from "@/components/common/form/form.types.ts";
import { useEmailResendCooldown } from "@/hooks/useEmailResendCooldown.ts";
import { signIn } from "@/lib/auth/auth-client.ts";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const useLoginForm = ({
  onSuccess,
}: IFormProps): IFormHook<LoginFormData> => {
  const navigate = useNavigate();
  const { markSent } = useEmailResendCooldown();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { formState } = form;

  const { handleSubmit } = form;

  const onSubmit = handleSubmit(async (data: LoginFormData) => {
    try {
      await signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onError: async (error) => {
            if (error.error.code === "EMAIL_NOT_VERIFIED") {
              markSent();
              await navigate(EMAIL_REDIRECT_PAGE, {
                state: { email: data.email },
              });
            } else {
              toast.error(error.error.message);
            }
          },
          onSuccess: async () => {
            toast.success("Welcome back!");
            onSuccess?.();
            await navigate(HOMEPAGE);
          },
        }
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  });

  return { form, onSubmit, isLoading: formState.isSubmitting };
};
