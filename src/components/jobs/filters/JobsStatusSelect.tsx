import { useCallback } from "react";
import type { TJobStatus } from "@/api/jobs";
import { STATUS_OPTIONS } from "@/components/jobs/jobs.helpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJobsStore } from "@/store/useJobsStore.ts";

const ALL = "all";

const STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: ALL },
  ...STATUS_OPTIONS,
];

export const JobsStatusSelect = () => {
  const status = useJobsStore((state) => state.status);
  const setStatus = useJobsStore((state) => state.setStatus);

  const handleValueChange = useCallback(
    (value: string | null) =>
      setStatus(
        value === ALL || value === null ? undefined : (value as TJobStatus)
      ),
    [setStatus]
  );

  return (
    <Select
      items={STATUS_FILTER_OPTIONS}
      onValueChange={handleValueChange}
      value={status ?? ALL}
    >
      <SelectTrigger aria-label="Filter by status" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_FILTER_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
