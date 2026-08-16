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
import { ReferenceCard } from "./ReferenceCard.tsx";

interface IProps {
  sectionId: string;
}

export const ReferencesSection = memo(({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const {
    fields,
    append: appendReference,
    remove: removeReference,
  } = useFieldArray({ control: form.control, name: "references" });

  const onAppend = () => appendReference({ email: undefined, name: "" });

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader>
        <CardTitle>References</CardTitle>
        <CardDescription>
          People who can vouch for your skills and experience.
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
          <ReferenceCard
            index={index}
            key={field.id}
            onRemove={removeReference}
          />
        ))}
        {fields.length === 0 && (
          <p className="text-center text-muted-foreground text-xs italic">
            No references added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
});
