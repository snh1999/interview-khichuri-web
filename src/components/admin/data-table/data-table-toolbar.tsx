import { XIcon } from "@phosphor-icons/react";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { IDataTableSearch } from "@/components/admin/data-table/data-table.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

interface IDataTableToolbarProps {
  search?: IDataTableSearch;
  onReset?: () => void;
  viewOptions?: ReactNode;
  children?: ReactNode;
}

const SEARCH_DEBOUNCE_MS = 300;

export const DataTableToolbar = ({
  search,
  onReset,
  viewOptions,
  children,
}: IDataTableToolbarProps) => {
  const [searchText, setSearchText] = useState(search?.value ?? "");
  const lastEmitted = useRef(search?.value ?? "");

  useEffect(() => {
    const value = search?.value ?? "";
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setSearchText(value);
    }
  }, [search?.value]);

  useEffect(() => {
    if (!search) {
      return;
    }
    const timeout = window.setTimeout(() => {
      if (searchText !== lastEmitted.current) {
        lastEmitted.current = searchText;
        search.onChange(searchText);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [searchText, search]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleReset = () => {
    setSearchText("");
    lastEmitted.current = "";
    onReset?.();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {search ? (
          <Input
            aria-label={search.placeholder}
            className="w-56"
            onChange={handleSearchChange}
            placeholder={search.placeholder}
            value={searchText}
          />
        ) : null}
        {children}
        {onReset ? (
          <Button onClick={handleReset} size="sm" variant="ghost">
            <XIcon data-icon="inline-start" />
            Reset
          </Button>
        ) : null}
      </div>
      {viewOptions}
    </div>
  );
};
