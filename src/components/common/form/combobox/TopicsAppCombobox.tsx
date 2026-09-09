import { useEffect, useMemo, useState } from "react";
import { useTopics } from "@/api/lookups";
import { AppCombobox } from "@/components/common/form/combobox/AppCombobox.tsx";

const identityOption = <D,>(item: D) => item;

interface IProps {
  disabled?: boolean;
  sessionTopicIds: number[];
  onValueChange: (topicNames: string[]) => void;
}

export const TopicsAppCombobox = ({
  disabled,
  sessionTopicIds,
  onValueChange,
}: Readonly<IProps>) => {
  const { data: allTopics } = useTopics();

  const options = useMemo(
    () => allTopics.map((topic) => ({ label: topic.name, value: topic.id })),
    [allTopics]
  );

  const [value, setValue] = useState<number[]>(sessionTopicIds);

  // Emit the current selection whenever the lookup or selection changes, so the
  // parent always has the topic names (session topics are preselected by default).
  useEffect(() => {
    onValueChange(
      allTopics
        .filter((topic) => value.includes(topic.id))
        .map((topic) => topic.name)
    );
  }, [allTopics, onValueChange, value]);

  const handleChange = (values: unknown[]) => setValue(values as number[]);

  return (
    <AppCombobox
      chipsBelow
      data={options}
      disabled={disabled}
      label="Topics"
      multiple
      name="topicIds"
      onChange={handleChange}
      placeholder="Search topics"
      toOption={identityOption}
      value={value}
    />
  );
};
