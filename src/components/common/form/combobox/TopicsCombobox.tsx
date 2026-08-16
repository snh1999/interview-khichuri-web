import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { TComboboxProps } from "@/components/common/form/combobox/FormCombobox.tsx";
import { LookupCombobox } from "@/components/common/form/combobox/LookupCombobox.tsx";

interface IProps<T extends FieldValues> extends Partial<TComboboxProps<T>> {
  form: UseFormReturn<T>;
  idsName: Path<T>;
  names: Path<T>;
  label?: string;
}

export const TopicsCombobox = <T extends FieldValues>({
  form,
  idsName,
  names,
  label = "Topics / Skills",
  placeholder = "Search or type to add topics",
  ...rest
}: Readonly<IProps<T>>) => (
  <LookupCombobox
    form={form}
    idsName={idsName}
    label={label}
    names={names}
    placeholder={placeholder}
    schema="topics"
    {...rest}
  />
);
