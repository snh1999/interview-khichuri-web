import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { useTopics } from "@/api/lookups";
import { FormCombobox } from "@/components/common/form/combobox/FormCombobox.tsx";
import { Chip } from "@/components/ui/Chip.tsx";
import { useLookupMap } from "@/hooks/useLookupMap.ts";

interface IProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  idsName: Path<T>;
  names: Path<T>;
  label?: string;
  placeholder?: string;
}

export const TopicsCombobox = <T extends FieldValues>({
  form,
  idsName,
  names,
  label = "Topics / Skills",
  placeholder = "Search or type to add topics",
}: Readonly<IProps<T>>) => {
  const topics = useTopics();
  const topicsMap = useLookupMap(topics.data);

  const getIds = () => (form.getValues(idsName) as number[]) ?? [];
  const getNames = () => (form.getValues(names) as string[]) ?? [];
  const setIds = (v: number[]) =>
    form.setValue(idsName, v as never, { shouldDirty: true });
  const setNames = (v: string[]) =>
    form.setValue(names, v as never, { shouldDirty: true });

  const handleCreateTopic = (name: string) => {
    const current = getNames();
    if (!current.includes(name)) {
      setNames([...current, name]);
    }
  };

  const handleRemoveTopicId = (id: number) => {
    setIds(getIds().filter((v) => v !== id));
  };

  const handleRemoveTopicName = (name: string) => {
    setNames(getNames().filter((n) => n !== name));
  };

  const topicIds = (form.watch(idsName) as number[]) ?? [];
  const topicNames = (form.watch(names) as string[]) ?? [];

  return (
    <div className="space-y-2">
      <FormCombobox
        creatable
        data={topics.data}
        form={form}
        hideChips
        label={label}
        multiple
        name={idsName}
        onCreateItem={handleCreateTopic}
        placeholder={placeholder}
        toOption={(item) => ({ value: item.id, label: item.name })}
      />
      {topicIds.length > 0 || topicNames.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {topicIds.map((id) => {
            const name = topicsMap.get(id)?.name;
            if (!name) {
              return null;
            }
            return (
              <Chip key={id} onRemove={() => handleRemoveTopicId(id)}>
                {name}
              </Chip>
            );
          })}
          {topicNames.map((name) => (
            <Chip key={name} onRemove={() => handleRemoveTopicName(name)}>
              {name}
            </Chip>
          ))}
        </div>
      ) : null}
    </div>
  );
};
