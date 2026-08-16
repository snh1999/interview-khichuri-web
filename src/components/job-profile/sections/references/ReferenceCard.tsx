import { TrashIcon } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { Button } from "@/components/ui/button.tsx";

interface IProps {
  index: number;
  onRemove: (index: number) => void;
}

export const ReferenceCard = ({ index, onRemove }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();
  const onRemoveClick = () => onRemove(index);

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
        <FormInput form={form} label="Name" name={`references.${index}.name`} />
        <FormInput
          form={form}
          label="Title"
          name={`references.${index}.title`}
          placeholder="e.g. Principal Investigator"
        />
        <FormInput
          form={form}
          label="Company"
          name={`references.${index}.company`}
        />
        <FormInput
          form={form}
          label="Relation"
          name={`references.${index}.relationType`}
          placeholder="e.g. Manager, Mentor, Colleague"
        />
        <FormInput
          form={form}
          label="Email"
          name={`references.${index}.email`}
          placeholder="name@example.com"
          type="email"
        />
        <FormInput
          form={form}
          label="Phone"
          name={`references.${index}.phone`}
        />
        <div className="md:col-span-2">
          <FormInput
            form={form}
            label="Notes"
            name={`references.${index}.notes`}
            placeholder="e.g. How you know this person"
          />
        </div>
      </div>
    </div>
  );
};
