import { Controller, type FieldValues } from "react-hook-form";
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
}: IFormInputProps<T>) => (
  <Controller
    control={form.control}
    name={name}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
        <InputGroup>
          {textArea ? (
            <InputGroupTextarea
              {...field}
              aria-invalid={fieldState.invalid}
              id={field.name}
              placeholder={placeholder}
            />
          ) : (
            <InputGroupInput
              {...field}
              aria-invalid={fieldState.invalid}
              id={field.name}
              placeholder={placeholder}
              type={type}
            />
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
              align="inline-end"
              className="text-muted-foreground/50"
            >
              {EndComponent}
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}

        {fieldState.invalid ? (
          <FieldError className="text-[12px]" errors={[fieldState.error]} />
        ) : null}
      </Field>
    )}
  />
);
