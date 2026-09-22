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

export const JOB_SORT_OPTIONS: { value: TJobSortKey; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "deadline", label: "Deadline" },
  { value: "interview", label: "Interview" },
] as const;

export const useJobSort = (): {
  currentSort: TJobSortKey;
  handleSortChange: (value: TJobSortKey) => void;
} => {
  const currentSort = useJobsStore((state) => state.sort);
  const handleSortChange = useJobsStore((state) => state.setSort);

  return { currentSort, handleSortChange };
};

export const JobsSortMenu = () => {
  const { currentSort, handleSortChange } = useJobSort();
  const label =
    JOB_SORT_OPTIONS.find((option) => option.value === currentSort)?.label ??
    "Sort";

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
          {JOB_SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
