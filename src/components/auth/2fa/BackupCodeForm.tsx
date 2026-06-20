"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { HOMEPAGE } from "@/app.constants.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authTwoFactor } from "@/lib/auth/auth-client.ts";

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
        navigate(HOMEPAGE);
      },
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(handleBackupCodeVerification)}
    >
      <FormInput form={form} label="Backup Code" name="code" />

      <Button className="w-full" disabled={isSubmitting} type="submit">
        <LoadingSwap isLoading={isSubmitting}>Verify</LoadingSwap>
      </Button>
    </form>
  );
};
