import { EnvelopeIcon, UserIcon } from "@phosphor-icons/react";
import { useRegisterForm } from "@/components/auth/register/RegisterForm.helpers.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import type { IFormProps } from "@/components/common/form/form.types.ts";
import { PasswordInput } from "@/components/common/form/PasswordInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";

export const RegisterForm = (props: IFormProps) => {
  const { isLoading, form, onSubmit } = useRegisterForm(props);

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormInput
        form={form}
        label="Full Name"
        name="name"
        placeholder="John Doe"
        StartComponent={<UserIcon />}
        type="text"
      />

      <FormInput
        form={form}
        label="Email"
        name="email"
        placeholder="dev@example.com"
        StartComponent={<EnvelopeIcon />}
        type="email"
      />

      <PasswordInput
        form={form}
        label="Password"
        name="password"
        showStrength
      />
      <PasswordInput
        form={form}
        label="Re-enter Password"
        name="confirmPassword"
      />

      <AsyncButton
        className="mt-2 w-full"
        isLoading={isLoading}
        size="lg"
        type="submit"
      >
        Register
      </AsyncButton>
    </form>
  );
};
