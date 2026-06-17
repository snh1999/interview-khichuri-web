import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { EMAIL_REDIRECT_PAGE } from "@/app.constants.ts";
import type {
  IFormHook,
  IFormProps,
} from "@/components/common/form/form.types.ts";
import { useEmailResendCooldown } from "@/hooks/useEmailResendCooldown.ts";
import { signUp } from "@/lib/auth/auth-client.ts";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const useRegisterForm = ({
  onSuccess,
}: IFormProps): IFormHook<RegisterFormData> => {
  const navigate = useNavigate();
  const { markSent } = useEmailResendCooldown();

  const form = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = form.handleSubmit(async (data: RegisterFormData) => {
    try {
      await signUp.email(
        { ...data },
        {
          onError: (error) => {
            toast.error(error.error.message || "Failed to create account");
          },
          onSuccess: async () => {
            markSent();
            await navigate(EMAIL_REDIRECT_PAGE, {
              state: { email: data.email },
            });
            onSuccess?.();
          },
        }
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  });

  return {
    form,
    onSubmit,
    isLoading: form.formState.isSubmitting,
  };
};
