import { EnvelopeIcon, UserIcon } from "@phosphor-icons/react";
import { useRegisterForm } from "@/components/auth/register/RegisterForm.helpers.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { PasswordInput } from "@/components/common/form/PasswordInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import type { TFormProps } from "@/components/common/form/form.types.ts";

export const RegisterForm = (props: TFormProps) => {
  const { isLoading, form, onSubmit } = useRegisterForm(props);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormInput
        form={form}
        name="name"
        label="Full Name"
        type="text"
        placeholder="John Doe"
        StartComponent={<UserIcon />}
      />

      <FormInput
        form={form}
        name="email"
        label="Email"
        type="email"
        placeholder="dev@example.com"
        StartComponent={<EnvelopeIcon />}
      />

      <PasswordInput
        form={form}
        name="password"
        label="Password"
        showStrength
      />
      <PasswordInput
        form={form}
        name="confirmPassword"
        label="Re-enter Password"
      />

      <AsyncButton
        type="submit"
        isLoading={isLoading}
        className="mt-2 w-full"
        size="lg"
      >
        Register
      </AsyncButton>
    </form>
  );
};
