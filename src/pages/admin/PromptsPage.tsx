import { TrashIcon } from "@phosphor-icons/react";
import type { ColumnDef, ColumnVisibilityState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type IAdminPromptsQuery,
  useAdminDeletePrompt,
  useAdminPrompts,
} from "@/api/admin/prompts";
import { type IPrompt, PROMPT_TYPE_LABELS, PROMPT_TYPES } from "@/api/prompts";
import {
  type adminTableFeatures,
  DataTable,
  DataTableSkeleton,
} from "@/components/admin/data-table/data-table.tsx";
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
import { formatDate } from "@/lib/date";

const EMPTY_PROMPTS: IPrompt[] = [];

const typeOptions = PROMPT_TYPES.map((value) => ({
  value,
  label: PROMPT_TYPE_LABELS[value],
}));

const scopeOptions = [{ value: "my", label: "My prompts" }];

const PromptDeleteAction = ({ prompt }: { prompt: IPrompt }) => {
  const [open, setOpen] = useState(false);
  const { isPending, mutate } = useAdminDeletePrompt();

  const handleDelete = () => {
    mutate(prompt.id, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Prompt deleted");
      },
    });
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger
        render={
          <Button aria-label="Delete prompt" size="icon-sm" variant="ghost">
            <TrashIcon />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete &ldquo;{prompt.title}&rdquo;?
          </AlertDialogTitle>
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

const baseColumns: ColumnDef<typeof adminTableFeatures, IPrompt>[] = [
  {
    accessorKey: "title",
    enableSorting: false,
    header: "Title",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "type",
    enableSorting: false,
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="secondary">{PROMPT_TYPE_LABELS[row.original.type]}</Badge>
    ),
  },
  {
    id: "scope",
    enableSorting: false,
    header: "Scope",
    cell: ({ row }) => (
      <Badge variant={row.original.isPublic ? "default" : "outline"}>
        {row.original.isPublic ? "Public" : "Private"}
      </Badge>
    ),
  },
  {
    accessorKey: "userId",
    enableSorting: false,
    header: "Owner",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.userId ?? "System"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    enableSorting: false,
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    enableHiding: false,
    enableSorting: false,
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PromptDeleteAction prompt={row.original} />
      </div>
    ),
  },
];

export const PromptsPage = () => (
  <AppErrorSuspense fallback={DataTableSkeleton}>
    <PromptsPageContent />
  </AppErrorSuspense>
);

const PromptsPageContent = () => {
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
  } = useDataTableUrlState();
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  const type = PROMPT_TYPES.find((value) => value === filters.type);
  const query: IAdminPromptsQuery = {
    limit: pagination.pageSize,
    page: pagination.pageIndex + 1,
    scope: filters.scope === "my" ? "my" : "public",
    search: filters.search,
    type,
  };
  const { data, isPending } = useAdminPrompts(query);

  const prompts = data ?? EMPTY_PROMPTS;
  // ponytail: /prompts returns no total; estimate one extra page when full.
  const rowCount =
    pagination.pageIndex * pagination.pageSize +
    prompts.length +
    (prompts.length === pagination.pageSize ? 1 : 0);

  const columns = useMemo<ColumnDef<typeof adminTableFeatures, IPrompt>[]>(
    () => baseColumns,
    []
  );

  const handleType = (value: string) => setFilter("type", value);
  const handleScope = (value: string) => setFilter("scope", value);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Prompts</h1>
        <p className="text-muted-foreground text-sm">
          Browse and moderate prompt library entries.
        </p>
      </div>

      {isPending ? (
        <DataTableSkeleton />
      ) : (
        <DataTable
          columnFilters={columnFilters}
          columns={columns}
          columnVisibility={columnVisibility}
          data={prompts}
          emptyMessage="No prompts found."
          onColumnFiltersChange={setColumnFilters}
          onColumnVisibilityChange={setColumnVisibility}
          onPaginationChange={setPagination}
          onReset={reset}
          onSortingChange={setSorting}
          pagination={pagination}
          rowCount={rowCount}
          search={{
            value: filters.search ?? "",
            onChange: (value) => setFilter("search", value),
            placeholder: "Search prompts",
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
                allLabel="Public"
                label="Scope"
                onChange={handleScope}
                options={scopeOptions}
                value={filters.scope ?? ""}
              />
            </>
          }
        />
      )}
    </div>
  );
};
