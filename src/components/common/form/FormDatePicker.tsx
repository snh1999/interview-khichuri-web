import { type FieldValues, useController } from "react-hook-form";
import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";
import { DatePicker } from "@/components/ui/custom/DatePicker.tsx";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

const toTimeInput = (d?: Date) =>
  d
    ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    : "";

type TProps<T extends FieldValues> = TBasicFormInputProps<T> & {
  withTime?: boolean;
};

export const FormDatePicker = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  disabled,
  autoFocus,
  withTime,
}: TProps<T>) => {
  const { field, fieldState } = useController({
    control: form.control,
    name,
  });

  const value: Date | undefined = field.value;

  const handleDateChange = (date?: Date) => {
    if (!withTime) {
      field.onChange(date);
      return;
    }
    if (!date) {
      field.onChange(undefined);
      return;
    }
    const next = new Date(date);
    if (value) {
      next.setHours(value.getHours(), value.getMinutes());
    }
    field.onChange(next);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      field.onChange(undefined);
      return;
    }
    const [h, m] = e.target.value.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return;
    }
    const next = new Date(value ?? new Date());
    next.setHours(h, m, 0, 0);
    field.onChange(next);
  };

  return (
    <Field data-invalid={fieldState.invalid}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <div className={withTime ? "flex gap-2" : undefined}>
        <DatePicker
          autoFocus={autoFocus}
          disabled={disabled}
          invalid={fieldState.invalid}
          name={field.name}
          onBlur={field.onBlur}
          onChange={handleDateChange}
          placeholder={placeholder}
          value={value}
        />
        {withTime ? (
          <InputGroup className="w-[60%]">
            <InputGroupInput
              aria-invalid={fieldState.invalid}
              className="text-xs"
              disabled={disabled}
              onChange={handleTimeChange}
              type="time"
              value={toTimeInput(value)}
            />
          </InputGroup>
        ) : null}
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {fieldState.invalid ? (
        <FieldError className="text-[12px]" errors={[fieldState.error]} />
      ) : null}
    </Field>
  );
};
