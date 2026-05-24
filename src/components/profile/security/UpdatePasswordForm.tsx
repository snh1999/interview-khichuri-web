import { z } from "zod";
import { changePassword } from "@/lib/auth/auth-client.ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PasswordInput } from "@/components/common/form/PasswordInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Invalid password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

function useUpdatePasswordForm() {
  const form = useForm<UpdatePasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: true,
    },
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = form.handleSubmit(async (data: UpdatePasswordFormData) => {
    try {
      await changePassword(data, {
        onError: (error) => {
          toast.error(error.error.message ?? "Failed to update password");
        },
        onSuccess: () => {
          toast.success("Password updated successfully");
          form.reset();
        },
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  });

  return { onSubmit, isSubmitting: form.formState.isSubmitting, form };
}

export const UpdatePasswordForm = () => {
  const { form, isSubmitting, onSubmit } = useUpdatePasswordForm();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PasswordInput
        form={form}
        name="currentPassword"
        label="Current Password"
      />

      <PasswordInput
        form={form}
        name="newPassword"
        label="New Password"
        showStrength
      />
      <PasswordInput
        form={form}
        name="confirmPassword"
        label="Re-enter new Password"
      />

      <FormCheckbox
        name="revokeOtherSessions"
        form={form}
        label="Log out of other sessions"
      />

      <AsyncButton
        type="submit"
        isLoading={isSubmitting}
        className="mt-2 w-full"
        size="lg"
      >
        Update Password
      </AsyncButton>
    </form>
  );
};
