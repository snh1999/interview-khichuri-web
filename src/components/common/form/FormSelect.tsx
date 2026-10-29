/* eslint-disable react/jsx-handler-names */

import { XIcon } from "@phosphor-icons/react";
import { type FieldValues, useController } from "react-hook-form";
import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";
import { Button } from "@/components/ui/button.tsx";
import { ButtonGroup } from "@/components/ui/button-group.tsx";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

type Props<T extends FieldValues> = TBasicFormInputProps<T> & {
  selectData: readonly { value: string; label: string }[];
};

const FormSelect = <T extends FieldValues>({
  selectData,
  form,
  name,
  label,
  placeholder,
  description,
}: Readonly<Props<T>>) => {
  const { field, fieldState } = useController({
    control: form.control,
    name,
  });
  const clearValue = () => field.onChange(null);

  return (
    <Field data-invalid={fieldState.invalid}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}

      <ButtonGroup
        className={`w-full ${fieldState.invalid ? "*:border-destructive" : ""}`}
      >
        <Select
          aria-invalid={fieldState.invalid}
          items={selectData}
          name={field.name}
          onValueChange={field.onChange}
          value={field.value ?? ""}
        >
          <SelectTrigger className="flex-1" id={field.name}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {selectData.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {field.value ? (
          <Button
            aria-label="Clear selection"
            onClick={clearValue}
            size="icon"
            variant="outline"
          >
            <XIcon />
          </Button>
        ) : null}
      </ButtonGroup>

      {description ? <FieldDescription>{description}</FieldDescription> : null}

      {fieldState.invalid ? (
        <FieldError
          className="line-clamp-1 text-sm"
          errors={[fieldState.error]}
        />
      ) : null}
    </Field>
  );
};
export default FormSelect;
