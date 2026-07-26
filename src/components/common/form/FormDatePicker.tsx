import { CalendarIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
} from "react-hook-form";
import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  return !!date && !Number.isNaN(date.getTime());
}

interface IDatePickerFieldProps<T extends FieldValues> {
  field: ControllerRenderProps<T>;
  fieldState: ControllerFieldState;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

const DatePickerField = <T extends FieldValues>({
  field,
  fieldState,
  label,
  placeholder,
  description,
  disabled,
}: Readonly<IDatePickerFieldProps<T>>) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(field.value);
  const [inputValue, setInputValue] = useState(formatDate(field.value));

  return (
    <Field data-invalid={fieldState.invalid}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <InputGroup>
        <InputGroupInput
          aria-invalid={fieldState.invalid}
          disabled={disabled}
          id={field.name}
          onBlur={() => field.onBlur()}
          onChange={(e) => {
            const parsed = new Date(e.target.value);
            setInputValue(e.target.value);
            if (isValidDate(parsed)) {
              field.onChange(parsed);
              setMonth(parsed);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          value={inputValue}
        />
        <InputGroupAddon align="inline-end">
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger
              disabled={disabled}
              render={
                <InputGroupButton
                  aria-label="Select date"
                  size="icon-xs"
                  variant="ghost"
                >
                  <CalendarIcon />
                </InputGroupButton>
              }
            />
            <PopoverContent
              align="end"
              alignOffset={-8}
              className="w-auto overflow-hidden p-0"
              sideOffset={10}
            >
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  field.onChange(date);
                  setInputValue(formatDate(date));
                  setOpen(false);
                }}
                selected={field.value}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {fieldState.invalid ? (
        <FieldError className="text-[12px]" errors={[fieldState.error]} />
      ) : null}
    </Field>
  );
};

export const FormDatePicker = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  disabled,
}: TBasicFormInputProps<T>) => (
  <Controller
    control={form.control}
    name={name}
    render={({ field, fieldState }) => (
      <DatePickerField
        description={description}
        disabled={disabled}
        field={field}
        fieldState={fieldState}
        label={label}
        placeholder={placeholder}
      />
    )}
  />
);
