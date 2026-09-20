import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useJobsStore } from "@/store/useJobsStore.ts";

interface IProps {
  placeholder?: string;
}

export const JobsSearchInput = ({
  placeholder = "Search jobs...",
}: Readonly<IProps>) => {
  const search = useJobsStore((state) => state.search);
  const setSearch = useJobsStore((state) => state.setSearch);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [setSearch]
  );

  const handleClear = useCallback(() => setSearch(""), [setSearch]);

  return (
    <InputGroup className="w-0 flex-1">
      <InputGroupAddon align="inline-start">
        <MagnifyingGlassIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        className="text-xs"
        onChange={handleChange}
        placeholder={placeholder}
        value={search}
      />
      {search ? (
        <InputGroupAddon align="inline-end">
          <Button
            aria-label="Clear search"
            onClick={handleClear}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <XIcon className="size-3" />
          </Button>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
};
