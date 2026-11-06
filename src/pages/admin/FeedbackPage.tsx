import { TrashIcon } from "@phosphor-icons/react";
import type { ColumnDef, ColumnVisibilityState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FEEDBACK_STATUS_OPTIONS,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
  type IAdminFeedback,
  type IAdminFeedbackQuery,
  useAdminDeleteFeedback,
  useAdminFeedback,
  useAdminUpdateFeedbackStatus,
} from "@/api/admin/feedback";
import {
  type adminTableFeatures,
  DataTable,
  DataTableSkeleton,
} from "@/components/admin/data-table/data-table.tsx";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header.tsx";
import { DataTableFilterSelect } from "@/components/admin/data-table/data-table-filter-select.tsx";
import { useDataTableUrlState } from "@/components/admin/data-table/use-data-table-url-state.ts";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { formatDate } from "@/lib/date";

const EMPTY_FEEDBACK: IAdminFeedback[] = [];

const typeOptions = FEEDBACK_TYPES.map((value) => ({
  value,
  label: FEEDBACK_TYPE_LABELS[value],
}));

const statusFilterOptions = FEEDBACK_STATUS_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const FeedbackStatusSelect = ({ item }: { item: IAdminFeedback }) => {
  const { isPending, mutate } = useAdminUpdateFeedbackStatus();

  if (item.type !== "bug") {
    return <span className="text-muted-foreground">—</span>;
  }

  const handleChange = (value: string | null) => {
    mutate(
      {
        id: item.id,
        status:
          value === null || value === "unset"
            ? null
            : (value as (typeof FEEDBACK_STATUSES)[number]),
      },
      { onSuccess: () => toast.success("Status updated") }
    );
  };

  return (
    <Select
      items={[...FEEDBACK_STATUS_OPTIONS]}
      onValueChange={handleChange}
      value={item.status ?? "unset"}
    >
      <SelectTrigger
        aria-label={`Status for feedback ${item.id}`}
        disabled={isPending}
        size="sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FEEDBACK_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const FeedbackDeleteAction = ({ item }: { item: IAdminFeedback }) => {
  const [open, setOpen] = useState(false);
  const { isPending, mutate } = useAdminDeleteFeedback();

  const handleDelete = () => {
    mutate(item.id, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Feedback deleted");
      },
    });
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger
        render={
          <Button aria-label="Delete feedback" size="icon-sm" variant="ghost">
            <TrashIcon />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this feedback?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const baseColumns: ColumnDef<typeof adminTableFeatures, IAdminFeedback>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.type === "bug" ? "default" : "secondary"}>
        {FEEDBACK_TYPE_LABELS[row.original.type as "bug" | "visit"] ??
          row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "message",
    enableSorting: false,
    header: "Message",
    cell: ({ row }) => (
      <span
        className="line-clamp-2 max-w-xs whitespace-pre-wrap"
        title={row.original.message}
      >
        {row.original.message}
      </span>
    ),
  },
  {
    accessorKey: "route",
    enableSorting: false,
    header: "Route",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.route}
      </span>
    ),
  },
  {
    accessorKey: "userId",
    enableSorting: false,
    header: "User",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.userId ?? "Anonymous"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <FeedbackStatusSelect item={row.original} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
  {
    id: "actions",
    enableHiding: false,
    enableSorting: false,
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <FeedbackDeleteAction item={row.original} />
      </div>
    ),
  },
];

export const FeedbackPage = () => (
  <AppErrorSuspense fallback={DataTableSkeleton}>
    <FeedbackPageContent />
  </AppErrorSuspense>
);

const FeedbackPageContent = () => {
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
  const type = FEEDBACK_TYPES.find((value) => value === filters.type);
  const status = [...FEEDBACK_STATUSES, "unset" as const].find(
    (value) => value === filters.status
  );
  const query: IAdminFeedbackQuery = {
    limit: pagination.pageSize,
    page: pagination.pageIndex + 1,
    q: filters.q,
    sort: firstSort
      ? `${firstSort.id}:${firstSort.desc ? "desc" : "asc"}`
      : "createdAt:desc",
    status,
    type,
  };
  const { data, isPending } = useAdminFeedback(query);

  const handleType = useCallback(
    (value: string) => setFilter("type", value),
    [setFilter]
  );
  const handleStatus = useCallback(
    (value: string) => setFilter("status", value),
    [setFilter]
  );

  const columns = useMemo<
    ColumnDef<typeof adminTableFeatures, IAdminFeedback>[]
  >(() => baseColumns, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Feedback</h1>
        <p className="text-muted-foreground text-sm">
          Review bug reports and track reference-link visits.
        </p>
      </div>

      {isPending ? (
        <DataTableSkeleton />
      ) : (
        <DataTable
          columnFilters={columnFilters}
          columns={columns}
          columnVisibility={columnVisibility}
          data={data?.items ?? EMPTY_FEEDBACK}
          emptyMessage="No feedback yet."
          onColumnFiltersChange={setColumnFilters}
          onColumnVisibilityChange={setColumnVisibility}
          onPaginationChange={setPagination}
          onReset={reset}
          onSortingChange={setSorting}
          pagination={pagination}
          rowCount={data?.total ?? 0}
          search={{
            onChange: (value) => setFilter("q", value),
            placeholder: "Search message or route",
            value: filters.q ?? "",
          }}
          sorting={sorting}
          toolbar={
            <>
              <DataTableFilterSelect
                allLabel="All types"
                label="Type"
                onChange={handleType}
                options={typeOptions}
                value={filters.type ?? ""}
              />
              <DataTableFilterSelect
                allLabel="All statuses"
                label="Status"
                onChange={handleStatus}
                options={statusFilterOptions}
                value={filters.status ?? ""}
              />
            </>
          }
        />
      )}
    </div>
  );
};
