import { EnvelopeIcon } from "@phosphor-icons/react";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { useForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm.helpers.ts";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button.tsx";
import type { TFormProps } from "@/components/common/form/form.types.ts";

export const ForgotPasswordForm = (props: TFormProps) => {
  const { onSubmit, form, isLoading, cooldown } = useForgotPasswordForm(props);

  const navigate = useNavigate();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormInput
        form={form}
        name="email"
        label="Email"
        type="email"
        placeholder="dev@example.com"
        StartComponent={<EnvelopeIcon />}
      />

      <div className="flex items-center justify-center gap-2">
        <Button
          className="flex-1"
          onClick={() => navigate(-1)}
          variant="secondary"
          size="lg"
        >
          Back
        </Button>
        <AsyncButton
          type="submit"
          isLoading={isLoading}
          disabled={!form.formState.isValid || cooldown > 0}
          className="flex-2"
          size="lg"
        >
          Send Link {cooldown ? `(${cooldown}s)` : ""}
        </AsyncButton>
      </div>
    </form>
  );
};
