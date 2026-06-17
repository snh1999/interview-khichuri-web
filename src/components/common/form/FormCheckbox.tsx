import { Controller, type FieldValues } from "react-hook-form";
import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.tsx";

export const FormCheckbox = <T extends FieldValues>({
  form,
  name,
  label,
  description,
  disabled,
}: Readonly<Omit<TBasicFormInputProps<T>, "placeholder">>) => (
  <Controller
    control={form.control}
    name={name}
    render={({ field: { name, value, onChange }, fieldState }) => (
      <div>
        <FieldGroup data-invalid={fieldState.invalid}>
          <Field orientation="horizontal">
            <Checkbox
              checked={value}
              disabled={disabled}
              id={name}
              name={name}
              onCheckedChange={onChange}
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
