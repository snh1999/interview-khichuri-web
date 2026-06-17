import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import type { IFormHook } from "@/components/common/form/form.types.ts";
import { changeEmail, updateUser } from "@/lib/auth/auth-client.ts";

const profileUpdateSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
});

type TUpdateProfileForm = z.infer<typeof profileUpdateSchema>;

export const useUpdateProfileForm = (
  user: TUpdateProfileForm
): IFormHook<TUpdateProfileForm> => {
  const form = useForm<TUpdateProfileForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: user,
  });

  useEffect(() => {
    form.reset(user, { keepDirtyValues: true });
  }, [user, form.reset]);

  const onSubmit = form.handleSubmit(async (data: TUpdateProfileForm) => {
    try {
      if (data.name !== user.name) {
        await updateUser(
          { name: data.name },
          {
            onError: (error) => {
              toast.error(error.error.message);
            },
            onSuccess: () => {
              toast.success("Profile updated!");
            },
          }
        );
      }

      if (data.email !== user.email) {
        await changeEmail(
          { newEmail: data.email },
          {
            onError: (error) => {
              toast.error(error.error.message);
            },
            onSuccess: () => {
              toast.success(
                "Verify your new email address to complete the change."
              );
            },
          }
        );
      }
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
