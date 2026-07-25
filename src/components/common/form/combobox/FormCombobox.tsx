import { PlusIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Controller, type FieldValues, useWatch } from "react-hook-form";
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
  isNew?: boolean;
}

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
  label,
  placeholder,
  description,
  multiple,
  creatable,
  onCreateItem,
  hideChips,
  disabled,
}: Readonly<TProps<T, D>>) => {
  const anchor = useComboboxAnchor();
  const options = data.map(toOption);
  const optionMap = new Map(options.map((o) => [o.value, o]));
  const valueWatch = useWatch({ control: form.control, name });
  const [inputValue, setInputValue] = useState(() => {
    const val = form.getValues(name);
    return val === null ? "" : (optionMap.get(val)?.label ?? "");
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const opt = optionMap.get(valueWatch);
    setInputValue(opt?.label ?? "");
  }, [valueWatch, optionMap]);

  const showCreate =
    !isCreating &&
    creatable &&
    inputValue.trim().length > 0 &&
    !options.some(
      (o) => o.label.toLowerCase() === inputValue.trim().toLowerCase()
    );

  const allItems = showCreate
    ? [
        ...options,
        { value: inputValue.trim(), label: inputValue.trim(), isNew: true },
      ]
    : options;

  return (
    <Controller
      control={form.control}
      name={name}
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <>
      render={({ field, fieldState }) => {
        const comboValue = multiple
          ? // biome-ignore lint/style/noNestedTernary: <>
            Array.isArray(field.value)
            ? field.value
                .map((val: string | number) => optionMap.get(val))
                .filter(Boolean)
            : []
          : field.value
            ? (optionMap.get(field.value) ?? null)
            : null;

        const handleBlur = field.onBlur;

        const handleValueChange = async (
          next: IComboboxOption | IComboboxOption[] | null
          // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <>
        ) => {
          if (multiple && Array.isArray(next)) {
            const normal = next.filter((opt) => !opt.isNew);
            const created = next.filter((opt) => opt.isNew);

            for (const item of created) {
              await onCreateItem?.(item.label);
            }

            field.onChange(normal.map((opt) => opt.value));
            if (created.length > 0) {
              setInputValue("");
            }
          } else {
            const opt = Array.isArray(next) ? (next[0] ?? null) : next;

            if (opt?.isNew) {
              setIsCreating(true);
              try {
                await onCreateItem?.(opt.label);
                setInputValue("");
              } finally {
                setIsCreating(false);
              }
            } else {
              field.onChange(opt?.value ?? null);
            }
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
              inputValue={inputValue}
              items={allItems}
              itemToStringValue={(opt: IComboboxOption) => opt.label}
              multiple={multiple}
              name={field.name}
              onInputValueChange={setInputValue}
              onValueChange={handleValueChange}
              value={comboValue}
            >
              {multiple && !hideChips ? (
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
                  disabled={isCreating || disabled}
                  id={field.name}
                  onBlur={handleBlur}
                  placeholder={isCreating ? "Creating..." : placeholder}
                  showTrigger={!isCreating}
                >
                  {isCreating && (
                    <SpinnerGapIcon className="mr-2 size-3.5 animate-spin text-muted-foreground" />
                  )}
                </ComboboxInput>
              )}
              <ComboboxContent anchor={multiple ? anchor : undefined}>
                <ComboboxEmpty>
                  {showCreate ? inputValue.trim() : "No items found."}
                </ComboboxEmpty>
                <ComboboxList>
                  {(opt: IComboboxOption) =>
                    opt.isNew ? (
                      <ComboboxItem
                        className="border-border border-t font-medium text-(--color-primary)"
                        disabled={isCreating}
                        key={String(opt.value)}
                        value={opt}
                      >
                        <PlusIcon className="size-3.5" />
                        {isCreating
                          ? `Creating "${opt.label}"...`
                          : `Create "${opt.label}"`}
                      </ComboboxItem>
                    ) : (
                      <ComboboxItem key={String(opt.value)} value={opt}>
                        {opt.label}
                      </ComboboxItem>
                    )
                  }
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
