import { PlusIcon } from "@phosphor-icons/react";
import { memo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { ProjectCard } from "./ProjectCard.tsx";

interface IProps {
  sectionId: string;
}

export const ProjectsSection = memo(({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const {
    fields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control: form.control, name: "projects" });

  const onAppend = () =>
    appendProject({
      link: undefined,
      name: "",
      skills: [],
      type: "project",
    });

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          Projects, experiments, and research work with relevant skills.
        </CardDescription>
        <CardAction className="pt-2 pr-1">
          <Button
            className="rounded-full bg-primary/50"
            onClick={onAppend}
            size="icon-sm"
          >
            <PlusIcon weight="bold" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <ProjectCard index={index} key={field.id} onRemove={removeProject} />
        ))}
        {fields.length === 0 && (
          <p className="text-center text-muted-foreground text-xs italic">
            No projects added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
});
