import { useCallback } from "react";
import type { TJobStatus } from "@/api/jobs";
import { STATUS_OPTIONS } from "@/components/jobs/jobs.helpers";
import { Button } from "@/components/ui/button.tsx";
import { useJobsStore } from "@/store/useJobsStore.ts";

const FILTERS: readonly (TJobStatus | "all")[] = [
  "all",
  ...STATUS_OPTIONS.map((option) => option.value),
];

interface IPillProps {
  filter: TJobStatus | "all";
  active: boolean;
  onChange: (value: TJobStatus | undefined) => void;
}

const labelFor = (filter: TJobStatus) =>
  STATUS_OPTIONS.find((option) => option.value === filter)?.label ?? filter;

const StatusPill = ({ filter, active, onChange }: Readonly<IPillProps>) => {
  const handleClick = useCallback(() => {
    onChange(filter === "all" ? undefined : filter);
  }, [filter, onChange]);

  return (
    <Button
      className="rounded-full"
      onClick={handleClick}
      type="button"
      variant={active ? "default" : "outline"}
    >
      {filter === "all" ? "All" : labelFor(filter)}
    </Button>
  );
};

export const JobsStatusPills = () => {
  const status = useJobsStore((state) => state.status);
  const setStatus = useJobsStore((state) => state.setStatus);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((filter) => (
        <StatusPill
          active={filter === "all" ? status === undefined : status === filter}
          filter={filter}
          key={filter}
          onChange={setStatus}
        />
      ))}
    </div>
  );
};
