/* eslint-disable react/jsx-handler-names */
import { Controller, type FieldValues } from "react-hook-form";
import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";
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
}: Readonly<Props<T>>) => (
  <Controller
    control={form.control}
    name={name}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
        <Select
          aria-invalid={fieldState.invalid}
          items={selectData}
          name={field.name}
          onValueChange={field.onChange}
          value={field.value}
        >
          <SelectTrigger className="w-full" id={field.name}>
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
export default FormSelect;
