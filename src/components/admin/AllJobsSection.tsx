import type { ColumnDef, ColumnVisibilityState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import {
  COMPANY_PROVIDERS,
  type IAdminJob,
  type IAdminJobsQuery,
  useAdminJobs,
} from "@/api/admin/companies";
import { JOB_STATES } from "@/api/jobs";
import {
  type adminTableFeatures,
  DataTable,
  DataTableSkeleton,
} from "@/components/admin/data-table/data-table.tsx";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header.tsx";
import { DataTableFilterSelect } from "@/components/admin/data-table/data-table-filter-select.tsx";
import { useDataTableUrlState } from "@/components/admin/data-table/use-data-table-url-state.ts";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { formatDate } from "@/lib/date";

const EMPTY_JOBS: IAdminJob[] = [];

const stateOptions = JOB_STATES.map((value) => ({ value, label: value }));
const providerOptions = COMPANY_PROVIDERS.map((value) => ({
  value,
  label: value,
}));

const stateVariant = (state: string) => {
  if (state === "failed") {
    return "destructive" as const;
  }
  if (state === "ok") {
    return "secondary" as const;
  }
  return "outline" as const;
};

const columns: ColumnDef<typeof adminTableFeatures, IAdminJob>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-sm" title={row.original.title}>
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
    cell: ({ row }) => (
      <Badge className="capitalize" variant={stateVariant(row.original.state)}>
        {row.original.state}
      </Badge>
    ),
  },
  {
    accessorKey: "provider",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Provider" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.original.provider ?? "—"}</span>
    ),
  },
  {
    accessorKey: "missedCrawls",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Missed" />
    ),
    cell: ({ row }) => row.original.missedCrawls ?? 0,
  },
  {
    accessorKey: "stateChangedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State changed" />
    ),
    cell: ({ row }) => formatDate(row.original.stateChangedAt),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

export const AllJobsSection = () => (
  <AppErrorSuspense fallback={DataTableSkeleton}>
    <AllJobsSectionContent />
  </AppErrorSuspense>
);

const AllJobsSectionContent = () => {
  const {
    filters,
    pagination,
    sorting,
    columnFilters,
    setPagination,
    setSorting,
    setColumnFilters,
    setFilter,
    reset,
  } = useDataTableUrlState({ defaultSort: "createdAt:desc" });
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  const [firstSort] = sorting;
  const companyId = Number(filters.companyId);
  const query: IAdminJobsQuery = {
    companyId: Number.isFinite(companyId) ? companyId : undefined,
    limit: pagination.pageSize,
    page: pagination.pageIndex + 1,
    provider: filters.provider,
    q: filters.q,
    sort: firstSort
      ? `${firstSort.id}:${firstSort.desc ? "desc" : "asc"}`
      : "createdAt:desc",
    state: filters.state,
  };
  const { data, isPending } = useAdminJobs(query);

  const handleState = useCallback(
    (value: string) => setFilter("state", value),
    [setFilter]
  );
  const handleProvider = useCallback(
    (value: string) => setFilter("provider", value),
    [setFilter]
  );

  const tableColumns = useMemo(() => columns, []);

  if (isPending) {
    return <DataTableSkeleton />;
  }

  return (
    <DataTable
      columnFilters={columnFilters}
      columns={tableColumns}
      columnVisibility={columnVisibility}
      data={data?.items ?? EMPTY_JOBS}
      emptyMessage="No jobs found."
      onColumnFiltersChange={setColumnFilters}
      onColumnVisibilityChange={setColumnVisibility}
      onPaginationChange={setPagination}
      onReset={reset}
      onSortingChange={setSorting}
      pagination={pagination}
      rowCount={data?.total ?? 0}
      search={{
        onChange: (value) => setFilter("q", value),
        placeholder: "Search title or company",
        value: filters.q ?? "",
      }}
      sorting={sorting}
      toolbar={
        <>
          <DataTableFilterSelect
            allLabel="All states"
            label="State"
            onChange={handleState}
            options={stateOptions}
            value={filters.state ?? ""}
          />
          <DataTableFilterSelect
            allLabel="All providers"
            label="Provider"
            onChange={handleProvider}
            options={providerOptions}
            value={filters.provider ?? ""}
          />
        </>
      }
    />
  );
};
