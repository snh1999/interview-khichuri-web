import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { authTwoFactor } from "@/lib/auth/auth-client.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { HOMEPAGE } from "@/app.constants.ts";

const totpSchema = z.object({
  code: z.string().length(6),
});

type TotpForm = z.infer<typeof totpSchema>;

export const TotpForm = () => {
  const navigate = useNavigate();
  const form = useForm<TotpForm>({
    resolver: zodResolver(totpSchema),
    defaultValues: {
      code: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleTotpVerification(data: TotpForm) {
    await authTwoFactor.verifyTotp(data, {
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
      onSubmit={form.handleSubmit(handleTotpVerification)}
    >
      <FormInput form={form} name="code" label="Code" />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        <LoadingSwap isLoading={isSubmitting}>Verify</LoadingSwap>
      </Button>
    </form>
  );
};
