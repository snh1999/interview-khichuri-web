import { EnvelopeIcon } from "@phosphor-icons/react";
import { useLoginForm } from "@/components/auth/login/LoginForm.helpers.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { PasswordInput } from "@/components/common/form/PasswordInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { FORGOT_PASSWORD_PAGE } from "@/app.constants.ts";
import type { TFormProps } from "@/components/common/form/form.types.ts";

export const LoginForm = (props: TFormProps) => {
  const { onSubmit, form, isLoading } = useLoginForm(props);

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
      <PasswordInput form={form} name="password" label="Password" />
      <div className="text-right">
        <LinkButton className="p-0" path={FORGOT_PASSWORD_PAGE}>
          Forgot Password?
        </LinkButton>
      </div>

      <AsyncButton
        type="submit"
        isLoading={isLoading}
        disabled={!form.formState.isValid}
        className="w-full"
        size="lg"
      >
        Log In
      </AsyncButton>
    </form>
  );
};
