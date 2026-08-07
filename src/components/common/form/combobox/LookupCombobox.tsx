import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import {
  type ILookupEntry,
  type TLookupSchema,
  useLookups,
} from "@/api/lookups";
import {
  FormCombobox,
  type TComboboxProps,
} from "@/components/common/form/combobox/FormCombobox.tsx";
import { Chip } from "@/components/ui/Chip.tsx";
import { useLookupMap } from "@/hooks/useLookupMap.ts";

interface IProps<T extends FieldValues> extends Partial<TComboboxProps<T>> {
  form: UseFormReturn<T>;
  idsName: Path<T>;
  names?: Path<T>;
  schema?: TLookupSchema;
  label?: string;
}

export const LookupCombobox = <T extends FieldValues>({
  form,
  idsName,
  names,
  schema = "topics",
  label = "Topics / Skills",
  placeholder = "Search or type to add topics",
  ...rest
}: Readonly<IProps<T>>) => {
  const lookups = useLookups(schema);
  const lookupsMap = useLookupMap(lookups.data);

  const getIds = (): Set<number> => new Set(form.getValues(idsName));
  const getNames = (): Set<string> =>  new Set(names? form.getValues(names): []);
  const setIds = (v: number[]) =>
    form.setValue(idsName, v as never, { shouldDirty: true });
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

  const handleRemoveId = (id: number) => {
    const current = getIds();
    current.delete(id)
    setIds([...current]);
  };

  const handleRemoveName = (name: string) => {
    const current = getNames();
    current.delete(name);
    setNames(current);
  };

  const ids = (form.watch(idsName) as number[] | null | undefined) ?? [];
  const pendingNames = names
    ? ((form.watch(names) as string[] | null | undefined) ?? [])
    : [];

  return (
    <div className="space-y-2">
      <FormCombobox
        creatable={Boolean(names)}
        data={lookups.data}
        form={form}
        hideChips
        label={label}
        multiple
        name={idsName}
        onCreateItem={names ? handleCreate : undefined}
        placeholder={placeholder}
        toOption={(item: ILookupEntry) => ({
          label: item.name,
          value: item.id,
        })}
        {...rest}
      />
      {ids.length > 0 || pendingNames.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {ids.map((id) => {
            const name = lookupsMap.get(id)?.name;
            if (!name) {
              return null;
            }
            return (
              <Chip key={id} onRemove={() => handleRemoveId(id)}>
                {name}
              </Chip>
            );
          })}
          {pendingNames.map((name) => (
            <Chip key={name} onRemove={() => handleRemoveName(name)}>
              {name}
            </Chip>
          ))}
        </div>
      ) : null}
    </div>
  );
};
