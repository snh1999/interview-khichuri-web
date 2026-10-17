import { type ChangeEvent, useCallback } from "react";
import { type FieldValues, useController } from "react-hook-form";
import type { IFormInputProps } from "@/components/common/form/form.types.ts";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group.tsx";

const toNumberOrNull = (raw: string): number | null => {
  if (raw === "") {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

export const FormInput = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type,
  description,
  StartComponent,
  EndComponent,
  textArea,
  rows,
}: IFormInputProps<T>) => {
  const { field, fieldState } = useController({
    control: form.control,
    name,
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      field.onChange(
        type === "number"
          ? toNumberOrNull(event.target.value)
          : event.target.value
      );
    },
    [field, type]
  );

  const options = {
    ...field,
    "aria-invalid": fieldState.invalid,
    className: "text-xs",
    id: field.name,
    placeholder,
    value: field.value ?? "",
  };

  return (
    <Field data-invalid={fieldState.invalid}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <InputGroup>
        {textArea ? (
          <InputGroupTextarea {...options} rows={rows} />
        ) : (
          <InputGroupInput {...options} onChange={handleChange} type={type} />
        )}
        {StartComponent ? (
          <InputGroupAddon
            align="inline-start"
            className="mx-1 text-muted-foreground/50"
          >
            {StartComponent}
          </InputGroupAddon>
        ) : null}

        {EndComponent ? (
          <InputGroupAddon
            align={textArea ? "block-end" : "inline-end"}
            className="text-muted-foreground/50"
          >
            {EndComponent}
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}

      {fieldState.invalid ? (
        <FieldError className="text-sm" errors={[fieldState.error]} />
      ) : null}
    </Field>
  );
};
