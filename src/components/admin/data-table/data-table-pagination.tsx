import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { RowData } from "@tanstack/react-table";
import type { TAdminTable } from "@/components/admin/data-table/data-table.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

const PAGE_SIZES = [10, 20, 50, 100];

interface IDataTablePaginationProps<TData extends RowData> {
  table: TAdminTable<TData>;
}

export const DataTablePagination = <TData extends RowData>({
  table,
}: IDataTablePaginationProps<TData>) => {
  const { pageIndex, pageSize } = table.state.pagination;
  const rowCount = table.getRowCount();
  const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, rowCount);

  const handlePageSize = (value: string | null) => {
    table.setPagination({ pageIndex: 0, pageSize: Number(value) });
  };
  const handlePrevious = () => table.previousPage();
  const handleNext = () => table.nextPage();
  const pageSizeItems = PAGE_SIZES.map((size) => ({
    label: `${size} / page`,
    value: String(size),
  }));

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span>
          Showing {from}–{to} of {rowCount}
        </span>
        <Select
          items={pageSizeItems}
          onValueChange={handlePageSize}
          value={String(pageSize)}
        >
          <SelectTrigger aria-label="Rows per page" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">
          Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <Button
          aria-label="Previous page"
          disabled={!table.getCanPreviousPage()}
          onClick={handlePrevious}
          size="icon-sm"
          variant="outline"
        >
          <CaretLeftIcon />
        </Button>
        <Button
          aria-label="Next page"
          disabled={!table.getCanNextPage()}
          onClick={handleNext}
          size="icon-sm"
          variant="outline"
        >
          <CaretRightIcon />
        </Button>
      </div>
    </div>
  );
};
