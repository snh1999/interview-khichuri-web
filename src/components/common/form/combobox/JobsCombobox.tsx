import type { FieldValues } from "react-hook-form";
import { useJobs } from "@/api/jobs";
import {
  FormCombobox,
  type TComboboxProps,
} from "@/components/common/form/combobox/FormCombobox.tsx";

export const JobsCombobox = <T extends FieldValues>({
  form,
  name,
  label = "Linked Job",
  placeholder = "Select a job",
  disabled,
  description,
}: Readonly<TComboboxProps<T>>) => {
  const jobs = useJobs();

  return (
    <FormCombobox
      data={jobs.data}
      description={description}
      disabled={disabled}
      form={form}
      label={label}
      name={name}
      placeholder={placeholder}
      toOption={(item) => ({
        value: item.id,
        label: `${item.title} @ ${item.companyName}`,
      })}
    />
  );
};
