import type { FieldValues } from "react-hook-form";
import type { TFormInputProps } from "@/components/common/form/form.types.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { EyeIcon, EyeSlashIcon, LockIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { InputGroupButton } from "@/components/ui/input-group.tsx";
import { PasswordStrengthIndicator } from "@/components/common/form/PasswordStrengthIndicator.tsx";

export const PasswordInput = <T extends FieldValues>({
  showStrength,
  ...props
}: Readonly<
  Omit<
    TFormInputProps<T>,
    "type" | "StartComponent" | "EndComponent" | "placeholder"
  > & { showStrength?: boolean }
>) => {
  const [showPassword, setShowPassword] = useState(false);
  const password = showStrength
    ? ((props.form.watch(props.name) as string) ?? "")
    : "";

  return (
    <div>
      <FormInput
        {...props}
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        StartComponent={<LockIcon />}
        EndComponent={
          <InputGroupButton onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </InputGroupButton>
        }
      />
      {showStrength ? <PasswordStrengthIndicator password={password} /> : null}
    </div>
  );
};
