import type { FieldValues } from "react-hook-form";
import { type IJob, useJobs } from "@/api/jobs";
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
  const { data: jobs } = useJobs();
  const toOption = (item: IJob) => ({
    value: item.id,
    label: `${item.title} @ ${item.companyName}`,
  });

  return (
    <FormCombobox
      data={jobs}
      description={description}
      disabled={disabled}
      form={form}
      label={label}
      name={name}
      placeholder={placeholder}
      toOption={toOption}
    />
  );
};
