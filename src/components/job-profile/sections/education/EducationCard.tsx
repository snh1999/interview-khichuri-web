import { TrashIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { FormDatePicker } from "@/components/common/form/FormDatePicker.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import { DEGREES } from "@/components/job-profile/profile.data.ts";
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

export const EducationCard = ({ index, onRemove }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const isCurrentName = `education.${index}.isCurrent` as const;
  const endDateName = `education.${index}.endDate` as const;

  const isCurrent = form.watch(isCurrentName);
  const onRemoveClick = () => onRemove(index);

  useEffect(() => {
    if (isCurrent) {
      form.setValue(endDateName, undefined);
    }
  }, [form, isCurrent, endDateName]);
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          {form.watch(`education.${index}.institution`) || "New Education"}
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
        <FormSelect
          form={form}
          label="Degree"
          name={`education.${index}.degreeName`}
          selectData={DEGREES}
        />

        <FormInput
          form={form}
          label="Field of Study"
          name={`education.${index}.institution`}
        />

        <FormInput
          form={form}
          label="Institution"
          name={`education.${index}.institution`}
        />

        <FormInput
          form={form}
          label="Location"
          name={`education.${index}.location`}
        />

        <div className="flex gap-4">
          <FormDatePicker
            form={form}
            label="Start Date"
            name={`education.${index}.startDate`}
          />
          <FormDatePicker
            disabled={isCurrent}
            form={form}
            label="Graduation Date"
            name={endDateName}
          />
        </div>

        <FormInput
          form={form}
          label="Notes"
          name={`education.${index}.notes`}
          textArea
        />

        <FormCheckbox
          form={form}
          label="Currently pursuing this degree"
          name={isCurrentName}
        />
      </CardContent>
    </Card>
  );
};
