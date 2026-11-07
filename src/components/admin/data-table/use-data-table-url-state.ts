import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useSearchParams } from "react-router";

const RESERVED_PARAMS = new Set(["page", "limit", "sort"]);

interface IOptions {
  defaultLimit?: number;
  defaultSort?: string;
}

const parseSorting = (value: string | null): SortingState =>
  value
    ? [
        {
          id: value.split(":")[0],
          desc: value.endsWith(":desc"),
        },
      ]
    : [];

export const useDataTableUrlState = ({
  defaultLimit = 20,
  defaultSort = "",
}: IOptions = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || defaultLimit);
  const pagination: PaginationState = { pageIndex: page - 1, pageSize: limit };
  const sortParam = searchParams.get("sort") ?? defaultSort;
  const sorting = parseSorting(sortParam || null);

  const filters: Record<string, string | undefined> = {};
  for (const [key, value] of searchParams.entries()) {
    if (!RESERVED_PARAMS.has(key) && value !== "") {
      filters[key] = value;
    }
  }
  const columnFilters: ColumnFiltersState = Object.entries(filters).map(
    ([id, value]) => ({ id, value })
  );

  const update = (mutate: (params: URLSearchParams) => void) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        mutate(next);
        return next;
      },
      { replace: true }
    );
  };

  const setPagination: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    update((params) => {
      params.set("page", String(next.pageIndex + 1));
      params.set("limit", String(next.pageSize));
    });
  };

  const setSorting: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    update((params) => {
      const [first] = next;
      if (first) {
        params.set("sort", `${first.id}:${first.desc ? "desc" : "asc"}`);
      } else {
        params.delete("sort");
      }
      params.set("page", "1");
    });
  };

  const setColumnFilters: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next =
      typeof updater === "function" ? updater(columnFilters) : updater;
    update((params) => {
      for (const key of Object.keys(filters)) {
        params.delete(key);
      }
      for (const filter of next) {
        const value =
          filter.value === null || filter.value === undefined
            ? ""
            : String(filter.value);
        if (value !== "") {
          params.set(filter.id, value);
        }
      }
      params.set("page", "1");
    });
  };

  const setFilter = (id: string, value: string) => {
    update((params) => {
      if (value === "") {
        params.delete(id);
      } else {
        params.set(id, value);
      }
      params.set("page", "1");
    });
  };

  const reset = () => {
    update((params) => {
      for (const key of [...params.keys()]) {
        if (!RESERVED_PARAMS.has(key)) {
          params.delete(key);
        }
      }
      params.delete("sort");
      params.set("page", "1");
    });
  };

  return {
    columnFilters,
    filters,
    pagination,
    reset,
    setColumnFilters,
    setFilter,
    setPagination,
    setSorting,
    sorting,
  };
};
