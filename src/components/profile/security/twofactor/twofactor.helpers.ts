import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authTwoFactor } from "@/lib/auth/auth-client.ts";
import type { TwoFactorData } from "@/components/profile/security/twofactor/QRCodeVerify.tsx";
import type { TFormHook } from "@/components/common/form/form.types.ts";

const qrSchema = z.object({
  token: z.string().length(6),
});

type QrForm = z.infer<typeof qrSchema>;

export const useQRCodeVerifyForm = (): TFormHook<QrForm> & {
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
): TFormHook<TwoFactorAuthForm> & {
  twoFactorData: TwoFactorData | null;
  clearTwoFactorData: () => void;
} => {
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
    null
  );
  const clearTwoFactorData = () => setTwoFactorData(null);
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
        onSuccess: () => form.reset(),
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        onSuccess: (result) => setTwoFactorData(result.data as TwoFactorData),
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
