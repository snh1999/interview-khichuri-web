import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination.tsx";
import { usePagination } from "@/hooks/usePagination.ts";
import { useMemo } from "react";
import { Field, FieldLabel } from "@/components/ui/field.tsx";

interface IProps {
  total: number;
  defaultPageLimit?: number;
}

const pageSizeOptions = [5, 10, 15, 25, 50, 100].map((value) => ({
  value,
  label: value,
}));

export const AppPagination = ({
  total,
  defaultPageLimit,
}: Readonly<IProps>) => {
  const { limit, page, setPage, setLimit } = usePagination(defaultPageLimit);

  const totalPages = Math.ceil(total / limit);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const pageOptions = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, value) => ({
        value: value + 1,
        label: value + 1,
      })),
    [totalPages]
  );

  const onLimitChange = (value: number | null) => {
    if (!value) return;
    setLimit(value);
  };

  const onPageChange = (page: number | null) => {
    if (!page) return;
    setPage(page);
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
        <Select
          value={limit}
          onValueChange={onLimitChange}
          items={pageSizeOptions}
        >
          <SelectTrigger className="w-20 border-none">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger>
            <SelectGroup>
              {pageSizeOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <div className="flex flex-col items-end gap-4">
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(page - 1)}
                  aria-disabled={!hasPrev}
                  className={
                    !hasPrev
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem className="text-muted-foreground flex items-center px-2 text-sm">
                <Select
                  value={page}
                  onValueChange={onPageChange}
                  items={pageOptions}
                >
                  <SelectTrigger className="mr-2 border-none">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger>
                    <SelectGroup>
                      {pageOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                / {totalPages}
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(page + 1)}
                  aria-disabled={!hasNext}
                  className={
                    !hasNext
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};
