import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  columnFilteringFeature,
  columnVisibilityFeature,
  type OnChangeFn,
  type PaginationState,
  type ReactTable,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { DataTablePagination } from "@/components/admin/data-table/data-table-pagination.tsx";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar.tsx";
import { DataTableViewOptions } from "@/components/admin/data-table/data-table-view-options.tsx";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

export const adminTableFeatures = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
});

export type TAdminTable<TData extends RowData> = ReactTable<
  typeof adminTableFeatures,
  TData
>;

const ariaSortFor = (sorted: false | "asc" | "desc") => {
  if (sorted === "asc") {
    return "ascending" as const;
  }
  if (sorted === "desc") {
    return "descending" as const;
  }
  return "none" as const;
};

const SKELETON_ROWS = [0, 1, 2, 3, 4];

export const DataTableSkeleton = () => (
  <div aria-busy="true" className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
    </div>
    <SkeletonCard compact noFooter>
      <Skeleton className="h-8 w-full" />
      {SKELETON_ROWS.map((row) => (
        <Skeleton className="h-9 w-full" key={row} />
      ))}
    </SkeletonCard>
    <span className="sr-only">Loading table…</span>
  </div>
);

export interface IDataTableSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface IDataTableProps<TData extends RowData> {
  columns: ColumnDef<typeof adminTableFeatures, TData>[];
  data: TData[];
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  columnVisibility: ColumnVisibilityState;
  onColumnVisibilityChange: OnChangeFn<ColumnVisibilityState>;
  search?: IDataTableSearch;
  toolbar?: ReactNode;
  onReset?: () => void;
  emptyMessage?: string;
}

export const DataTable = <TData extends RowData>({
  columns,
  data,
  rowCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
  search,
  toolbar,
  onReset,
  emptyMessage = "No results.",
}: IDataTableProps<TData>) => {
  const table = useTable({
    features: adminTableFeatures,
    columns,
    data,
    rowCount,
    autoResetPageIndex: false,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { pagination, sorting, columnFilters, columnVisibility },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
  });

  return (
    <div className="flex flex-col gap-3">
      <DataTableToolbar
        onReset={onReset}
        search={search}
        viewOptions={<DataTableViewOptions table={table} />}
      >
        {toolbar}
      </DataTableToolbar>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const ariaSort = header.column.getCanSort()
                    ? ariaSortFor(header.column.getIsSorted())
                    : undefined;

                  return (
                    <TableHead aria-sort={ariaSort} key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="text-muted-foreground h-24 text-center"
                  colSpan={table.getVisibleLeafColumns().length}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
};
