import type { ReactNode } from "react";
import { type FieldValues, useController } from "react-hook-form";
import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";
import { MarkdownEditor } from "@/components/ui/custom/MarkdownEditor.tsx";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field.tsx";

interface IFormMarkdownInputProps<T extends FieldValues>
  extends TBasicFormInputProps<T> {
  height?: number | string;
  labelSuffix?: ReactNode;
}

export const FormMarkdownInput = <T extends FieldValues>({
  form,
  name,
  label,
  labelSuffix,
  placeholder,
  description,
  disabled,
  autoFocus,
  height,
}: IFormMarkdownInputProps<T>) => {
  const { field, fieldState } = useController({
    control: form.control,
    name,
  });

  return (
    <Field data-invalid={fieldState.invalid}>
      {label || labelSuffix ? (
        <div className="flex items-center justify-between gap-2">
          {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
          {labelSuffix}
        </div>
      ) : null}

      <MarkdownEditor
        autoFocus={autoFocus}
        disabled={disabled}
        height={height}
        invalid={fieldState.invalid}
        name={field.name}
        onBlur={field.onBlur}
        onChange={field.onChange}
        placeholder={placeholder}
        value={field.value ?? ""}
      />

      {description ? <FieldDescription>{description}</FieldDescription> : null}

      {fieldState.invalid ? (
        <FieldError className="text-sm" errors={[fieldState.error]} />
      ) : null}
    </Field>
  );
};
