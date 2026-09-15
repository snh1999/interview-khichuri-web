/** biome-ignore-all lint/performance/noJsxPropsBind: <> */
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import {
  type ILookupEntry,
  type TLookupSchema,
  useLookups,
} from "@/api/lookups";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import {
  FormCombobox,
  type IComboboxOption,
  type TComboboxProps,
} from "@/components/common/form/combobox/FormCombobox.tsx";
import { Skeleton } from "@/components/ui/skeleton";

interface IProps<T extends FieldValues> extends Partial<TComboboxProps<T>> {
  form: UseFormReturn<T>;
  idsName: Path<T>;
  names?: Path<T>;
  schema?: TLookupSchema;
  label?: string;
}

const toLookupOption = (item: ILookupEntry): IComboboxOption => ({
  label: item.name,
  value: item.id,
});

const comboboxFallback = () => <Skeleton className="h-7 w-full rounded-md" />;

export const LookupCombobox = <T extends FieldValues>(
  props: Readonly<IProps<T>>
) => (
  <AppErrorSuspense fallback={comboboxFallback}>
    <LookupComboboxContent {...props} />
  </AppErrorSuspense>
);

const LookupComboboxContent = <T extends FieldValues>({
  form,
  idsName,
  names,
  schema = "topics",
  label = "Topics / Skills",
  placeholder = "Search or type to add topics",
  ...rest
}: Readonly<IProps<T>>) => {
  const lookups = useLookups(schema);

  const getNames = (): Set<string> =>
    new Set(names ? form.getValues(names) : []);
  const setNames = (v: Set<string>) => {
    const value = [...v] as never;
    if (names) {
      form.setValue(names, value, { shouldDirty: true });
    }
  };

  const handleCreate = (name: string) => {
    const current = getNames();
    if (!current.has(name)) {
      current.add(name);
      setNames(current);
    }
  };

  const handleRemoveName = (name: string) => {
    const current = getNames();
    current.delete(name);
    setNames(current);
  };

  const pendingNames = names
    ? ((form.watch(names) as string[] | null | undefined) ?? [])
    : [];

  return (
    <FormCombobox
      chipsBelow
      creatable={Boolean(names)}
      data={lookups.data}
      extraChips={pendingNames}
      form={form}
      label={label}
      multiple
      name={idsName}
      onCreateItem={names ? handleCreate : undefined}
      onRemoveExtraChip={names ? handleRemoveName : undefined}
      placeholder={placeholder}
      toOption={toLookupOption}
      {...rest}
    />
  );
};
