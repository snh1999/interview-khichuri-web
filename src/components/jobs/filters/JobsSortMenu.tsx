import { SortAscendingIcon } from "@phosphor-icons/react";
import type { TJobSortKey } from "@/api/jobs";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJobsStore } from "@/store/useJobsStore";

interface IJobSortOption {
  value: TJobSortKey;
  label: string;
}

export const JOB_SORT_OPTIONS: readonly IJobSortOption[] = [
  { value: "default", label: "Default" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "deadline", label: "Deadline" },
  { value: "interview", label: "Interview" },
  { value: "applied", label: "Applied" },
] as const;

export const DISCOVER_SORT_OPTIONS: readonly IJobSortOption[] =
  JOB_SORT_OPTIONS.filter(
    (option) => option.value !== "interview" && option.value !== "applied"
  );

export const isDiscoverSort = (sort: TJobSortKey) =>
  DISCOVER_SORT_OPTIONS.some((option) => option.value === sort);

export const JobsSortMenu = ({
  options = JOB_SORT_OPTIONS,
}: Readonly<{ options?: readonly IJobSortOption[] }>) => {
  const currentSort = useJobsStore((state) => state.sort);
  const handleSortChange = useJobsStore((state) => state.setSort);
  const label =
    options.find((option) => option.value === currentSort)?.label ?? "Sort";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="gap-1.5" variant="outline">
            <SortAscendingIcon className="size-3.5" />
            <span className="max-w-32 truncate">{label}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          onValueChange={handleSortChange}
          value={currentSort}
        >
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
