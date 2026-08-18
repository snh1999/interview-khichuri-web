import { EnvelopeIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router";
import { useForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm.helpers.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import type { IFormProps } from "@/components/common/form/form.types.ts";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";

export const ForgotPasswordForm = (props: IFormProps) => {
  const { onSubmit, form, isLoading, cooldown } = useForgotPasswordForm(props);

  const navigate = useNavigate();
  const handleBackClick = () => navigate(-1);

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormInput
        form={form}
        label="Email"
        name="email"
        placeholder="dev@example.com"
        StartComponent={<EnvelopeIcon />}
        type="email"
      />

      <div className="flex items-center justify-center gap-2">
        <Button
          className="flex-1"
          onClick={handleBackClick}
          size="lg"
          variant="secondary"
        >
          Back
        </Button>
        <AsyncButton
          className="flex-1"
          disabled={!form.formState.isValid || cooldown > 0}
          isLoading={isLoading}
          size="lg"
          type="submit"
        >
          Send Link {cooldown ? `(${cooldown}s)` : ""}
        </AsyncButton>
      </div>
    </form>
  );
};
