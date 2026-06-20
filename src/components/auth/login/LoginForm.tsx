import { EnvelopeIcon } from "@phosphor-icons/react";
import { FORGOT_PASSWORD_PAGE } from "@/app.constants.ts";
import { useLoginForm } from "@/components/auth/login/LoginForm.helpers.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import type { IFormProps } from "@/components/common/form/form.types.ts";
import { PasswordInput } from "@/components/common/form/PasswordInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";

export const LoginForm = (props: IFormProps) => {
  const { onSubmit, form, isLoading } = useLoginForm(props);

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
      <PasswordInput form={form} label="Password" name="password" />
      <div className="text-right">
        <LinkButton className="p-0" path={FORGOT_PASSWORD_PAGE}>
          Forgot Password?
        </LinkButton>
      </div>

      <AsyncButton
        className="w-full"
        disabled={!form.formState.isValid}
        isLoading={isLoading}
        size="lg"
        type="submit"
      >
        Log In
      </AsyncButton>
    </form>
  );
};
