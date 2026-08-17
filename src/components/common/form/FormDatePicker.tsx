import { type FieldValues, useController } from "react-hook-form";
import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";
import { DatePicker } from "@/components/ui/custom/DatePicker.tsx";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export const FormDatePicker = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  disabled,
  autoFocus,
}: TBasicFormInputProps<T>) => {
  const { field, fieldState } = useController({
    control: form.control,
    name,
  });

  return (
    <Field data-invalid={fieldState.invalid}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <DatePicker
        {...field}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {fieldState.invalid ? (
        <FieldError className="text-[12px]" errors={[fieldState.error]} />
      ) : null}
    </Field>
  );
};
