import { TrashIcon } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { FormDatePicker } from "@/components/common/form/FormDatePicker.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface IProps {
  readonly index: number;
  readonly onRemove: () => void;
}

export const WorkExperienceCard = ({
  index,

  onRemove,
}: IProps) => {
  const form = useFormContext();
  const isCurrent = form.watch(`workExperience.${index}.isCurrent`);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          {form.watch(`workExperience.${index}.company`) || "New Experience"}
        </CardTitle>
        <CardAction>
          <Button
            onClick={onRemove}
            size="sm"
            type="button"
            variant="destructive"
          >
            <TrashIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
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

          <FormDatePicker
            form={form}
            label="Start Date"
            name={`workExperience.${index}.startDate`}
          />
          <FormDatePicker
            disabled={isCurrent}
            form={form}
            label="End Date"
            name={`workExperience.${index}.endDate`}
          />
        </div>

        <div className="py-4">
          <FormInput
            form={form}
            label="Key Responsibilities"
            name={`workExperience.${index}.responsibilities`}
            textArea
          />
        </div>

        <FormCheckbox
          form={form}
          label="Currently working here"
          name={`workExperience.${index}.isCurrent`}
        />
      </CardContent>
    </Card>
  );
};
