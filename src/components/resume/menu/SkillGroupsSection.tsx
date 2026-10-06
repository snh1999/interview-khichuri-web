import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import {
  MAX_SKILL_GROUPS,
  type TResumeFormData,
} from "@/components/resume/job-profile/resume.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface IProps {
  sectionId: string;
}

export const SkillGroupsSection = ({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TResumeFormData>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skillGroups",
  });

  const addSkillGroup = () =>
    append({ id: crypto.randomUUID(), keywords: "", label: "" });

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
            disabled={fields.length >= MAX_SKILL_GROUPS}
            onClick={addSkillGroup}
            size="icon-sm"
          >
            <PlusIcon weight="bold" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {fields.map((group, index) => (
          <SkillGroup index={index} key={group.id} onRemove={remove} />
        ))}

        {fields.length === 0 && (
          <p className="text-center text-muted-foreground text-xs italic">
            No skill groups defined.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface IGroupProps {
  index: number;
  onRemove: (index: number) => void;
}

const SkillGroup = ({ onRemove, index }: Readonly<IGroupProps>) => {
  const form = useFormContext<TResumeFormData>();
  const onRemoveClick = () => onRemove(index);

  return (
    <div className="flex items-center gap-2">
      <FormInput
        form={form}
        name={`skillGroups.${index}.label`}
        placeholder="Label"
      />

      <FormInput
        form={form}
        name={`skillGroups.${index}.keywords`}
        placeholder="Comma-separated skills"
      />
      <Button onClick={onRemoveClick} variant="destructive">
        <TrashIcon />
      </Button>
    </div>
  );
};
