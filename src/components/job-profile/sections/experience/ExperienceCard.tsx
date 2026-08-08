import { TrashIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { FormDatePicker } from "@/components/common/form/FormDatePicker.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface IProps {
  index: number;
  onRemove: (index: number) => void;
}

export const WorkExperienceCard = ({ index, onRemove }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();
  const isCurrentName = `workExperience.${index}.isCurrent` as const;
  const endDateName = `workExperience.${index}.endDate` as const;
  const isCurrent = form.watch(isCurrentName);

  useEffect(() => {
    if (isCurrent) {
      form.setValue(endDateName, undefined);
    }
  }, [form, isCurrent, endDateName]);

  const onRemoveClick = () => onRemove(index);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          {form.watch(`workExperience.${index}.company`) || "New Experience"}
        </CardTitle>
        <CardAction>
          <Button
            onClick={onRemoveClick}
            size="sm"
            type="button"
            variant="destructive"
          >
            <TrashIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <FormInput
          form={form}
          label="Company"
          name={`workExperience.${index}.company`}
        />
        <FormInput
          form={form}
          label="Job Title"
          name={`workExperience.${index}.title`}
        />

        <div className="flex gap-4">
          <FormDatePicker
            form={form}
            label="Start Date"
            name={`workExperience.${index}.startDate`}
          />
          <FormDatePicker
            disabled={isCurrent}
            form={form}
            label="End Date"
            name={endDateName}
          />
        </div>

        <FormInput
          form={form}
          label="Key Responsibilities"
          name={`workExperience.${index}.responsibilities`}
          textArea
        />

        <FormCheckbox
          form={form}
          label="Currently working here"
          name={isCurrentName}
        />
      </CardContent>
    </Card>
  );
};
