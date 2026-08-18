import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useJobs } from "@/api/jobs";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox.tsx";

const JOB_FILTER_KEY = "job";
interface IJobOption {
  value: string;
  label: string;
}

export const useJobFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const jobFilter = searchParams.get(JOB_FILTER_KEY) ?? "";

  const setJobFilter = (jobId?: string | null) => {
    setSearchParams(
      (prev) => {
        if (jobId) {
          prev.set(JOB_FILTER_KEY, jobId);
        } else {
          prev.delete(JOB_FILTER_KEY);
        }
        return prev;
      },
      { replace: true }
    );
  };

  return {
    jobFilter,
    setJobFilter,
  };
};

export const JobFilter = () => {
  const { data: jobs } = useJobs();
  const { jobFilter, setJobFilter } = useJobFilter();

  const options: IJobOption[] = jobs.map((job) => ({
    value: job.id,
    label: `${job.title} @ ${job.companyName}`,
  }));
  const optionMap = new Map(options.map((o) => [o.value, o]));

  const selectedOption = jobFilter ? (optionMap.get(jobFilter) ?? null) : null;
  const [inputValue, setInputValue] = useState(
    () => selectedOption?.label ?? ""
  );

  // Sync input text when the URL filter changes externally (back/forward cleared params) as useState only initializes the value once.
  useEffect(() => {
    setInputValue(selectedOption?.label ?? "");
  }, [selectedOption]);

  const handleValueChange = (next: IJobOption | IJobOption[] | null) => {
    const opt = Array.isArray(next) ? (next[0] ?? null) : next;
    setJobFilter(opt?.value ? String(opt.value) : null);
  };

  const itemToStringValue = (opt: IJobOption) => opt.label;

  return (
    <Combobox
      autoHighlight
      inputValue={inputValue}
      items={options}
      itemToStringValue={itemToStringValue}
      onInputValueChange={setInputValue}
      onValueChange={handleValueChange}
      value={selectedOption}
    >
      <ComboboxInput placeholder="Filter by job..." showClear />
      <ComboboxContent>
        <ComboboxEmpty>No jobs found.</ComboboxEmpty>
        <ComboboxList>
          {(opt: IJobOption) => (
            <ComboboxItem key={opt.value} value={opt}>
              {opt.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
