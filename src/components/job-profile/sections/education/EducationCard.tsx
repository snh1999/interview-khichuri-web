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
  onRemove: () => void;
}

export const EducationCard = ({ index, onRemove }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();
  const isCurrent = form.watch(`education.${index}.isCurrent`);

  useEffect(() => {
    if (isCurrent) {
      form.setValue(`education.${index}.endDate`, null as never);
    }
  }, [form, index, isCurrent]);
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          {form.watch(`education.${index}.institution`) || "New Education"}
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
        <div className="grid grid-cols-2 gap-4 pb-4">
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

          <FormDatePicker
            form={form}
            label="Start Date"
            name={`education.${index}.startDate`}
          />
          <FormDatePicker
            disabled={isCurrent}
            form={form}
            label="Graduation Date"
            name={`education.${index}.endDate`}
          />
        </div>
        <div className="py-4">
          <FormCheckbox
            form={form}
            label="Currently pursuing this degree"
            name={`education.${index}.isCurrent`}
          />
        </div>
        <FormInput
          form={form}
          label="Notes"
          name={`education.${index}.notes`}
          textArea
        />
      </CardContent>
    </Card>
  );
};
