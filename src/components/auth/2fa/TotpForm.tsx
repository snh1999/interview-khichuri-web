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
      <FormInput form={form} label="Code" name="code" />

      <Button className="w-full" disabled={isSubmitting} type="submit">
        <LoadingSwap isLoading={isSubmitting}>Verify</LoadingSwap>
      </Button>
    </form>
  );
};
