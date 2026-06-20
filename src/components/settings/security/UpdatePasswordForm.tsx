import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { PasswordInput } from "@/components/common/form/PasswordInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { changePassword } from "@/lib/auth/auth-client.ts";

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
    <form className="space-y-4" onSubmit={onSubmit}>
      <PasswordInput
        form={form}
        label="Current Password"
        name="currentPassword"
      />

      <PasswordInput
        form={form}
        label="New Password"
        name="newPassword"
        showStrength
      />
      <PasswordInput
        form={form}
        label="Re-enter new Password"
        name="confirmPassword"
      />

      <FormCheckbox
        form={form}
        label="Log out of other sessions"
        name="revokeOtherSessions"
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
