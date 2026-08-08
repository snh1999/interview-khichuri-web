import { TrashIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { FormDatePicker } from "@/components/common/form/FormDatePicker.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { Button } from "@/components/ui/button.tsx";

interface IProps {
  index: number;
  onRemove: (index: number) => void;
}

export const ActivityCard = ({ index, onRemove }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const isCurrentName = `activities.${index}.isCurrent` as const;
  const endDateName = `activities.${index}.endDate` as const;

  const isCurrent = form.watch(isCurrentName);
  const onRemoveClick = () => onRemove(index);

  useEffect(() => {
    if (isCurrent) {
      form.setValue(endDateName, undefined);
    }
  }, [form, endDateName, isCurrent]);

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex justify-end">
        <Button
          onClick={onRemoveClick}
          size="sm"
          type="button"
          variant="destructive"
        >
          <TrashIcon />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormInput form={form} label="Name" name={`activities.${index}.name`} />
        <FormInput
          form={form}
          label="Organization"
          name={`activities.${index}.organization`}
        />
        <FormInput
          form={form}
          label="Position"
          name={`activities.${index}.position`}
          placeholder="e.g. Volunteer, Treasurer"
        />

        <div className="flex gap-4">
          <FormDatePicker
            form={form}
            label="Start Date"
            name={`activities.${index}.startDate`}
          />
          <FormDatePicker
            disabled={isCurrent}
            form={form}
            label="End Date"
            name={endDateName}
          />
        </div>

        <div className="md:col-span-2">
          <FormInput
            form={form}
            label="Notes"
            name={`activities.${index}.notes`}
            placeholder="One bullet point per line"
            textArea
          />
        </div>
        <FormCheckbox
          form={form}
          label="Current activity"
          name={isCurrentName}
        />
      </div>
    </div>
  );
};
