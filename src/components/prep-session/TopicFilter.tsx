import { FunnelIcon, XIcon } from "@phosphor-icons/react";
import { useSearchParams } from "react-router";
import { useTopics } from "@/api/lookups";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ButtonGroup } from "@/components/ui/button-group.tsx";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox.tsx";

const TOPICS_FILTER_KEY = "topics";

export const useTopicFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const topicsFilter = searchParams.get(TOPICS_FILTER_KEY) ?? "";
  const selectedTopicIds = topicsFilter
    ? topicsFilter.split(",").map(Number).filter(Boolean)
    : [];

  const setTopicIds = (ids: number[]) => {
    setSearchParams(
      (prev) => {
        if (ids.length > 0) {
          prev.set(TOPICS_FILTER_KEY, ids.join(","));
        } else {
          prev.delete(TOPICS_FILTER_KEY);
        }
        return prev;
      },
      { replace: true }
    );
  };

  return {
    selectedTopicIds,
    setTopicIds,
  };
};

export const TopicFilter = () => {
  const { data: topics } = useTopics();
  const { selectedTopicIds, setTopicIds } = useTopicFilter();

  return (
    <Combobox
      items={topics}
      multiple
      onValueChange={setTopicIds}
      value={selectedTopicIds}
    >
      <ComboboxTrigger
        render={
          <ButtonGroup>
            <Button
              variant={selectedTopicIds.length > 0 ? "secondary" : "outline"}
            >
              <FunnelIcon className="size-3" />
              Topics
              {selectedTopicIds.length > 0 ? (
                <Badge className="rounded-full bg-primary/40">
                  {selectedTopicIds.length}
                </Badge>
              ) : null}
            </Button>
            {selectedTopicIds.length > 0 ? (
              <Button onClick={() => setTopicIds([])} variant="secondary">
                <XIcon />
              </Button>
            ) : null}
          </ButtonGroup>
        }
      />
      <ComboboxContent align="end" className="w-64">
        <ComboboxInput placeholder="Search topics..." showTrigger={false} />
        <ComboboxEmpty>No topics found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxCollection>
            {(topic) => (
              <ComboboxItem key={topic.id} value={topic.id}>
                {topic.name}
              </ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
