import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { type ISkillGroup, useResumeStore } from "@/store/resumeStore.ts";

interface IProps {
  sectionId: string;
}

const MAX_GROUPS = 5;

export const SkillGroupsSection = ({ sectionId }: Readonly<IProps>) => {
  const skillGroups = useResumeStore((state) => state.skillGroups);
  const addSkillGroup = useResumeStore((state) => state.addSkillGroup);

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader>
        <CardTitle>Skill Groups</CardTitle>
        <CardDescription>
          Organize your skills into labeled groups shown on the template.
        </CardDescription>
        <CardAction className="pt-2 pr-1">
          <Button
            className="rounded-full bg-primary/50"
            disabled={skillGroups.length >= MAX_GROUPS}
            onClick={addSkillGroup}
            size="icon-sm"
          >
            <PlusIcon weight="bold" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {skillGroups.length === 0 && (
          <p className="text-center text-muted-foreground text-xs italic">
            No skill groups defined. Add a group to get started.
          </p>
        )}
        {skillGroups.map((group) => (
          <SkillGroup group={group} key={group.id} />
        ))}
      </CardContent>
    </Card>
  );
};

interface IGroupProps {
  group: ISkillGroup;
}
const SkillGroup = ({ group }: Readonly<IGroupProps>) => {
  const updateSkillGroup = useResumeStore((state) => state.updateSkillGroup);
  const removeSkillGroup = useResumeStore((state) => state.removeSkillGroup);

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    updateSkillGroup(group.id, { label: event.target.value });
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    updateSkillGroup(group.id, { keywords: event.target.value });

  const handleRemove = () => removeSkillGroup(group.id);

  return (
    <div className="flex items-center gap-2">
      <Input
        className="w-1/3"
        onChange={handleLabelChange}
        placeholder="Label"
        value={group.label}
      />
      <Input
        className="flex-1"
        onChange={handleKeywordChange}
        placeholder="Comma-separated skills"
        value={group.keywords}
      />
      <Button onClick={handleRemove} variant="destructive">
        <TrashIcon />
      </Button>
    </div>
  );
};
