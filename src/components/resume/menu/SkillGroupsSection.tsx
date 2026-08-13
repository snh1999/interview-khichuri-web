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
import { useResumeStore } from "@/store/resumeStore.ts";

interface IProps {
  sectionId: string;
}

const MAX_GROUPS = 5;

export const SkillGroupsSection = ({ sectionId }: Readonly<IProps>) => {
  const skillGroups = useResumeStore((state) => state.skillGroups);
  const updateSkillGroup = useResumeStore((state) => state.updateSkillGroup);
  const addSkillGroup = useResumeStore((state) => state.addSkillGroup);
  const removeSkillGroup = useResumeStore((state) => state.removeSkillGroup);

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
          <div className="flex items-center gap-2" key={group.id}>
            <Input
              className="w-1/3"
              onChange={(event) =>
                updateSkillGroup(group.id, { label: event.target.value })
              }
              placeholder="Label"
              value={group.label}
            />
            <Input
              className="flex-1"
              onChange={(event) =>
                updateSkillGroup(group.id, { keywords: event.target.value })
              }
              placeholder="Comma-separated skills"
              value={group.keywords}
            />
            <Button
              onClick={() => removeSkillGroup(group.id)}
              variant="destructive"
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
