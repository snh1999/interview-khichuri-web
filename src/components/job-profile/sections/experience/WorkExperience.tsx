import { PlusIcon } from "@phosphor-icons/react";
import { memo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { WorkExperienceCard } from "@/components/job-profile/sections/experience/ExperienceCard.tsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IProps {
  sectionId: string;
}

export const WorkExperience = memo(({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const {
    fields: workExpFields,
    append: appendWorkExp,
    remove: removeWorkExp,
  } = useFieldArray({ control: form.control, name: "workExperience" });

  const onAppend = () =>
    appendWorkExp({
      company: "",
      title: "",
      isCurrent: false,
    });

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader className="border-b">
        <CardTitle>Work Experience</CardTitle>
        <CardDescription>Your professional history.</CardDescription>
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
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {workExpFields.map((field, index) => (
          <WorkExperienceCard
            index={index}
            key={field.id}
            onRemove={removeWorkExp}
          />
        ))}
        {workExpFields.length === 0 && (
          <p className="text-center text-muted-foreground text-xs italic">
            No work experience added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
});
