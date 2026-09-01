import { type FieldValues, useController } from "react-hook-form";
import type { IComboboxOption } from "@/components/common/form/combobox/AppCombobox.tsx";
import { AppCombobox } from "@/components/common/form/combobox/AppCombobox.tsx";
import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";

export type { IComboboxOption } from "@/components/common/form/combobox/AppCombobox.tsx";

export type TComboboxProps<T extends FieldValues> = TBasicFormInputProps<T> & {
  multiple?: boolean;
  creatable?: boolean;
  onCreateItem?: (label: string) => void | Promise<void>;
  hideChips?: boolean;
  initialValue?: T;
};

type TProps<T extends FieldValues, D> = TComboboxProps<T> & {
  data: D[];
  toOption: (item: D) => IComboboxOption;
};

export const FormCombobox = <T extends FieldValues, D>({
  data,
  toOption,
  form,
  name,
  ...rest
}: Readonly<TProps<T, D>>) => {
  const { field, fieldState } = useController({
    control: form.control,
    name,
  });

  return (
    <AppCombobox
      data={data}
      error={fieldState.error?.message}
      toOption={toOption}
      {...rest}
      {...field}
    />
  );
};
