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
import { PublicationCard } from "./PublicationCard.tsx";

interface IProps {
  sectionId: string;
}

export const PublicationsSection = memo(({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const {
    fields,
    append: appendPublication,
    remove: removePublication,
  } = useFieldArray({ control: form.control, name: "publications" });

  const onAppend = () =>
    appendPublication({ authors: [], link: undefined, title: "" });

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader>
        <CardTitle>Publications</CardTitle>
        <CardDescription>
          Academic papers, conference proceedings, and other publications.
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
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field, index) => (
          <PublicationCard
            index={index}
            key={field.id}
            onRemove={removePublication}
          />
        ))}
        {fields.length === 0 && (
          <p className="text-center text-muted-foreground text-xs italic">
            No publications added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
});
