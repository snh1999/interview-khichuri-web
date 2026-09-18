import type { FieldValues } from "react-hook-form";
import { type IJob, useGetJobs } from "@/api/jobs";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import {
  FormCombobox,
  type TComboboxProps,
} from "@/components/common/form/combobox/FormCombobox.tsx";
import { Skeleton } from "@/components/ui/skeleton";

const comboboxFallback = () => <Skeleton className="h-7 w-full rounded-md" />;

export const JobsCombobox = <T extends FieldValues>(
  props: Readonly<TComboboxProps<T>>
) => (
  <AppErrorSuspense fallback={comboboxFallback}>
    <JobsComboboxContent {...props} />
  </AppErrorSuspense>
);

const JobsComboboxContent = <T extends FieldValues>({
  form,
  name,
  label = "Linked Job",
  placeholder = "Select a job",
  disabled,
  description,
}: Readonly<TComboboxProps<T>>) => {
  const { data: jobs } = useGetJobs();
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
