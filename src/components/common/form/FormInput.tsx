import { Controller, type FieldValues } from "react-hook-form";
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
} from "@/components/ui/input-group.tsx";
import type { TFormInputProps } from "@/components/common/form/form.types.ts";

export const FormInput = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type,
  description,
  StartComponent,
  EndComponent,
}: TFormInputProps<T>) => (
  <Controller
    name={name}
    control={form.control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
        <InputGroup>
          <InputGroupInput
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            type={type}
          />
          {StartComponent ? (
            <InputGroupAddon
              className="text-muted-foreground/50 mx-1"
              align="inline-start"
            >
              {StartComponent}
            </InputGroupAddon>
          ) : null}

          {EndComponent ? (
            <InputGroupAddon
              className="text-muted-foreground/50"
              align="inline-end"
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
