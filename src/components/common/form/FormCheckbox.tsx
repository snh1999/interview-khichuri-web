import { Controller, type FieldValues } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field.tsx";

import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";

export const FormCheckbox = <T extends FieldValues>({
  form,
  name,
  label,
  description,
  disabled,
}: Readonly<Omit<TBasicFormInputProps<T>, "placeholder">>) => (
  <Controller
    name={name}
    control={form.control}
    render={({ field: { name, value, onChange }, fieldState }) => (
      <div>
        <FieldGroup data-invalid={fieldState.invalid}>
          <Field orientation="horizontal">
            <Checkbox
              id={name}
              name={name}
              checked={value}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <FieldContent>
              <FieldLabel htmlFor={name}>{label}</FieldLabel>
              <FieldDescription>{description}</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
        {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
      </div>
    )}
  />
);
