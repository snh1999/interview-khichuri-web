import { Controller, type FieldValues } from "react-hook-form";
import type { TBasicFormInputProps } from "@/components/common/form/form.types.ts";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox.tsx";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field.tsx";

export interface IComboboxOption {
  value: string | number;
  label: string;
}

type Props<T extends FieldValues, D> = TBasicFormInputProps<T> & {
  data: D[];
  toOption: (item: D) => IComboboxOption;
  multiple?: boolean;
};

export const FormCombobox = <T extends FieldValues, D>({
  data,
  toOption,
  form,
  name,
  label,
  placeholder,
  description,
  multiple,
}: Readonly<Props<T, D>>) => {
  const anchor = useComboboxAnchor();
  const options = data.map(toOption);

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const comboValue = multiple
          ? // biome-ignore lint/style/noNestedTernary: <>
            Array.isArray(field.value)
            ? field.value
                .map((val: string | number) =>
                  options.find((opt) => opt.value === val)
                )
                .filter(Boolean)
            : []
          : field.value
            ? (options.find((opt) => opt.value === field.value) ?? null)
            : null;

        const handleBlur = field.onBlur;
        const handleValueChange = (
          next: IComboboxOption | IComboboxOption[] | null
        ) => {
          if (multiple) {
            // biome-ignore lint/style/noNestedTernary: <>
            const arr = Array.isArray(next) ? next : next ? [next] : [];
            field.onChange(arr.map((opt) => opt.value));
          } else {
            const opt = Array.isArray(next) ? (next[0] ?? null) : next;
            field.onChange(opt?.value ?? null);
          }
        };

        return (
          <Field data-invalid={fieldState.invalid}>
            {label ? (
              <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            ) : null}
            <Combobox
              aria-invalid={fieldState.invalid}
              autoHighlight
              items={options}
              itemToStringValue={(opt: IComboboxOption) => opt.label}
              multiple={multiple}
              name={field.name}
              onValueChange={handleValueChange}
              value={comboValue}
            >
              {multiple ? (
                <ComboboxChips className="w-full" id={field.name} ref={anchor}>
                  <ComboboxValue>
                    {(values: IComboboxOption[]) => (
                      <>
                        {values.map((opt) => (
                          <ComboboxChip key={String(opt.value)}>
                            {opt.label}
                          </ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          onBlur={handleBlur}
                          placeholder={placeholder}
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
              ) : (
                <ComboboxInput
                  id={field.name}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                />
              )}
              <ComboboxContent anchor={multiple ? anchor : undefined}>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(opt: IComboboxOption) => (
                    <ComboboxItem key={String(opt.value)} value={opt}>
                      {opt.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            {fieldState.invalid ? (
              <FieldError className="text-[12px]" errors={[fieldState.error]} />
            ) : null}
          </Field>
        );
      }}
    />
  );
};
