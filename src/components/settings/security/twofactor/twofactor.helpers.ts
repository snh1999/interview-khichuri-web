import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { IFormHook } from "@/components/common/form/form.types.ts";
import type { ITwoFactorData } from "@/components/settings/security/twofactor/QRCodeVerify.tsx";
import { authTwoFactor } from "@/lib/auth/auth-client.ts";

const qrSchema = z.object({
  token: z.string().length(6),
});

type QrForm = z.infer<typeof qrSchema>;

export const useQRCodeVerifyForm = (): IFormHook<QrForm> & {
  enabled: boolean;
} => {
  const [enabled, setEnabled] = useState(false);
  const form = useForm<QrForm>({
    resolver: zodResolver(qrSchema),
    defaultValues: { token: "" },
  });
  const onSubmit = form.handleSubmit(async (data) => {
    await authTwoFactor.verifyTotp(
      {
        code: data.token,
      },
      {
        onError: (error) => {
          toast.error(error.error.message || "Failed to verify code");
        },
        onSuccess: () => {
          setEnabled(true);
        },
      }
    );
  });
  return { enabled, onSubmit, form, isLoading: form.formState.isSubmitting };
};

const twoFactorAuthSchema = z.object({
  password: z.string().min(8),
});

type TwoFactorAuthForm = z.infer<typeof twoFactorAuthSchema>;

export const useTwoFactorAuthForm = (
  isEnabled: boolean
): IFormHook<TwoFactorAuthForm> & {
  twoFactorData: ITwoFactorData | null;
  clearTwoFactorData: () => void;
} => {
  const [twoFactorData, setTwoFactorData] = useState<ITwoFactorData | null>(
    null
  );
  const clearTwoFactorData = () => {
    setTwoFactorData(null);
  };
  const form = useForm<TwoFactorAuthForm>({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues: { password: "" },
  });

  const handleDisableTwoFactorAuth = async (data: TwoFactorAuthForm) => {
    await authTwoFactor.disable(
      { password: data.password },
      {
        onError: (error) => {
          toast.error(error.error.message);
        },
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  const handleEnableTwoFactorAuth = async (data: TwoFactorAuthForm) => {
    await authTwoFactor.enable(
      { password: data.password },
      {
        onError: (result) => {
          toast.error(result.error.message);
        },

        onSuccess: (result) => {
          setTwoFactorData(result.data as ITwoFactorData);
        },
      }
    );
    form.reset();
  };

  const onSubmit = form.handleSubmit(
    isEnabled ? handleDisableTwoFactorAuth : handleEnableTwoFactorAuth
  );

  return {
    twoFactorData,
    clearTwoFactorData,
    onSubmit,
    form,
    isLoading: form.formState.isSubmitting,
  };
};
