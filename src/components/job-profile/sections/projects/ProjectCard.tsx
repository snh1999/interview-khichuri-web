import { TrashIcon } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { LookupCombobox } from "@/components/common/form/combobox/LookupCombobox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import { PROJECT_TYPES } from "@/components/job-profile/profile.data.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { Button } from "@/components/ui/button.tsx";

interface IProps {
  index: number;
  onRemove: (index: number) => void;
}

export const ProjectCard = ({ index, onRemove }: Readonly<IProps>) => {
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
        <FormInput form={form} label="Name" name={`projects.${index}.name`} />
        <FormSelect
          form={form}
          label="Type"
          name={`projects.${index}.type`}
          selectData={PROJECT_TYPES}
        />
        <FormInput
          form={form}
          label="Link"
          name={`projects.${index}.link`}
          placeholder="https://..."
          type="url"
        />
        <div className="md:col-span-2">
          <FormInput
            form={form}
            label="Description"
            name={`projects.${index}.description`}
            placeholder="Describe the project, your role, and outcomes"
            textArea
          />
        </div>
        <div className="md:col-span-2">
          <LookupCombobox
            form={form}
            idsName={`projects.${index}.skills`}
            label="Skills"
            placeholder="Add skills"
          />
        </div>
      </div>
    </div>
  );
};
