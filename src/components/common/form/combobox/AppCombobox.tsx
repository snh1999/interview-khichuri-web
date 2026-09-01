import { PlusIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
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

type TValue = string | number;

interface IBaseProps {
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  creatable?: boolean;
  onCreateItem?: (label: string) => void | Promise<void>;
  hideChips?: boolean;
  error?: string;
  name?: string;
  onBlur?: () => void;
}

interface ISingleProps<D> extends IBaseProps {
  data: D[];
  toOption: (item: D) => IComboboxOption;
  multiple?: false;
  value: TValue | null;
  onChange: (value: TValue | null) => void;
}

interface IMultiProps<D> extends IBaseProps {
  data: D[];
  toOption: (item: D) => IComboboxOption;
  multiple: true;
  value: TValue[];
  onChange: (value: TValue[]) => void;
}

export type TAppComboboxProps<D> = ISingleProps<D> | IMultiProps<D>;

export const AppCombobox = <D,>(props: TAppComboboxProps<D>) => {
  const {
    data,
    toOption,
    label,
    placeholder,
    description,
    multiple,
    creatable,
    onCreateItem,
    hideChips,
    disabled,
    error,
    name,
    onBlur,
    value,
    onChange,
  } = props;

  const anchor = useComboboxAnchor();

  const options = useMemo(() => data.map(toOption), [data, toOption]);
  const optionMap = useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options]
  );

  const [inputValue, setInputValue] = useState(() => {
    if (multiple) {
      return "";
    }
    return value === null ? "" : (optionMap.get(value)?.label ?? "");
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (multiple) {
      return;
    }
    const opt = value === null ? undefined : optionMap.get(value);
    setInputValue(opt?.label ?? "");
  }, [value, optionMap, multiple]);

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
        { isNew: true, label: inputValue.trim(), value: inputValue.trim() },
      ]
    : options;

  const comboValue = multiple
    ? (value as TValue[])
        .map((v) => optionMap.get(v))
        .filter((o): o is IComboboxOption => o !== null && o!==undefined)
    : // biome-ignore lint/style/noNestedTernary: <>
      value === null
      ? null
      : (optionMap.get(value) ?? null);

  const handleValueChange = async (
    next: IComboboxOption | IComboboxOption[] | null
  ) => {
    if (multiple && Array.isArray(next)) {
      const normal = next.filter((opt) => !opt.isNew);
      const created = next.filter((opt) => opt.isNew);

      if (onCreateItem) {
        await Promise.all(created.map((item) => onCreateItem(item.label)));
      }

      (onChange as (v: TValue[]) => void)(normal.map((opt) => opt.value));
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
        (onChange as (v: TValue | null) => void)(opt?.value ?? null);
      }
    }
  };

  const itemToStringValue = (opt: IComboboxOption) => opt.label;

  return (
    <Field data-invalid={!!error}>
      {label ? <FieldLabel htmlFor={name}>{label}</FieldLabel> : null}
      <Combobox
        aria-invalid={!!error}
        autoHighlight
        inputValue={inputValue}
        items={allItems}
        itemToStringValue={itemToStringValue}
        multiple={multiple}
        name={name}
        onInputValueChange={setInputValue}
        onValueChange={handleValueChange}
        value={comboValue}
      >
        {multiple && !hideChips ? (
          <ComboboxChips className="w-full" id={name} ref={anchor}>
            <ComboboxValue>
              {(values: IComboboxOption[]) => (
                <>
                  {values.map((opt) => (
                    <ComboboxChip key={String(opt.value)}>
                      {opt.label}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    onBlur={onBlur}
                    placeholder={placeholder}
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
        ) : (
          <ComboboxInput
            disabled={isCreating || disabled}
            id={name}
            onBlur={onBlur}
            placeholder={isCreating ? "Creating..." : placeholder}
            showTrigger={!isCreating}
          >
            {isCreating ? (
              <SpinnerGapIcon className="mr-2 size-3.5 animate-spin text-muted-foreground" />
            ) : null}
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
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? (
        <FieldError className="text-[12px]" errors={[{ message: error }]} />
      ) : null}
    </Field>
  );
};
