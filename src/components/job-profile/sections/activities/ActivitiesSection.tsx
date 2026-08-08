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
import { ActivityCard } from "./ActivityCard.tsx";

interface IProps {
  sectionId: string;
}

export const ActivitiesSection = memo(({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const {
    fields,
    append: appendActivity,
    remove: removeActivity,
  } = useFieldArray({ control: form.control, name: "activities" });

  const onAppend = () => appendActivity({ isCurrent: false, name: "" });

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader>
        <CardTitle>Activities</CardTitle>
        <CardDescription>
          Volunteer work, clubs, leadership, and other activities.
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
          <ActivityCard
            index={index}
            key={field.id}
            onRemove={removeActivity}
          />
        ))}
        {fields.length === 0 && (
          <p className="text-center text-muted-foreground text-xs italic">
            No activities added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
});
