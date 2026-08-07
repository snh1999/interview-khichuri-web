import { PlusIcon } from "@phosphor-icons/react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { EducationCard } from "@/components/job-profile/sections/education/EducationCard.tsx";
import { Button } from "@/components/ui/button.tsx";
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

export const EducationInformation = ({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control: form.control, name: "education" });

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader className="border-b">
        <CardTitle>Education</CardTitle>
        <CardDescription>Your academic background.</CardDescription>
        <CardAction className="pt-2 pr-1">
          <Button
            className="rounded-full bg-primary/50"
            onClick={() =>
              appendEducation({
                degreeName: "",
                institution: "",
                isCurrent: false,
              })
            }
            size="icon-sm"
          >
            <PlusIcon weight="bold" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {educationFields.map((field, index) => (
          <EducationCard
            index={index}
            key={field.id}
            onRemove={() => removeEducation(index)}
          />
        ))}
        {educationFields.length === 0 && (
          <p className="text-center text-muted-foreground text-xs italic">
            No Education Information yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
