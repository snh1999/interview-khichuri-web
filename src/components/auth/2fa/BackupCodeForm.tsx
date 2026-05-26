"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { authTwoFactor } from "@/lib/auth/auth-client.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";

const backupCodeSchema = z.object({
  code: z.string().min(1),
});

type BackupCodeForm = z.infer<typeof backupCodeSchema>;

export const BackupCodeForm = () => {
  const navigate = useNavigate();
  const form = useForm<BackupCodeForm>({
    resolver: zodResolver(backupCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleBackupCodeVerification(data: BackupCodeForm) {
    await authTwoFactor.verifyBackupCode(data, {
      onError: (error) => {
        toast.error(error.error.message || "Failed to verify code");
      },
      onSuccess: () => {
        navigate("/");
      },
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(handleBackupCodeVerification)}
    >
      <FormInput form={form} name="code" label="Backup Code" />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        <LoadingSwap isLoading={isSubmitting}>Verify</LoadingSwap>
      </Button>
    </form>
  );
};
