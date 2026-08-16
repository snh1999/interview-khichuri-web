import { EyeIcon, EyeSlashIcon, LockIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import type { IFormInputProps } from "@/components/common/form/form.types.ts";
import { PasswordStrengthIndicator } from "@/components/common/form/PasswordStrengthIndicator.tsx";
import { InputGroupButton } from "@/components/ui/input-group.tsx";

export const PasswordInput = <T extends FieldValues>({
  showStrength,
  ...props
}: Readonly<
  Omit<
    IFormInputProps<T>,
    "type" | "StartComponent" | "EndComponent" | "placeholder"
  > & { showStrength?: boolean }
>) => {
  const [showPassword, setShowPassword] = useState(false);
  const password = showStrength ? (props.form.watch(props.name) ?? "") : "";
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div>
      <FormInput
        {...props}
        EndComponent={
          <InputGroupButton onClick={toggleShowPassword}>
            {showPassword ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </InputGroupButton>
        }
        placeholder="••••••••"
        StartComponent={<LockIcon />}
        type={showPassword ? "text" : "password"}
      />
      {showStrength ? <PasswordStrengthIndicator password={password} /> : null}
    </div>
  );
};
