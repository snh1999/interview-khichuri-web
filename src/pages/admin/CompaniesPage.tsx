import { PencilLineIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type { ColumnDef, ColumnVisibilityState } from "@tanstack/react-table";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type IAdminCompaniesQuery,
  type ICompanyInput,
  useAdminCompanies,
  useAdminCreateCompany,
  useAdminDeleteCompany,
  useAdminUpdateCompany,
} from "@/api/admin/companies";
import type { ICompany } from "@/api/resumes";
import {
  type adminTableFeatures,
  DataTable,
  DataTableSkeleton,
} from "@/components/admin/data-table/data-table.tsx";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header.tsx";
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
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { formatDate } from "@/lib/date";

const EMPTY_COMPANIES: ICompany[] = [];

const CompanyDeleteAction = ({ company }: { company: ICompany }) => {
  const [open, setOpen] = useState(false);
  const { isPending, mutate } = useAdminDeleteCompany();

  const handleDelete = () => {
    mutate(company.id, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Company deleted");
      },
    });
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger
        render={
          <Button aria-label="Delete company" size="icon-sm" variant="ghost">
            <TrashIcon />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete &ldquo;{company.name}&rdquo;?
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

const baseColumns: ColumnDef<typeof adminTableFeatures, ICompany>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "aliases",
    enableSorting: false,
    header: "Aliases",
    cell: ({ row }) => row.original.aliases?.join(", ") || "—",
  },
  {
    accessorKey: "careerPageUrl",
    enableSorting: false,
    header: "Career page",
    cell: ({ row }) =>
      row.original.careerPageUrl ? (
        <a
          className="text-primary underline-offset-4 hover:underline"
          href={row.original.careerPageUrl}
          rel="noreferrer"
          target="_blank"
        >
          {row.original.careerPageUrl}
        </a>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "createdAt",
    enableSorting: false,
    header: "Created",
    cell: ({ row }) =>
      row.original.createdAt ? formatDate(row.original.createdAt) : "—",
  },
];

interface ICompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: ICompany;
}

const CompanyFormDialog = ({
  open,
  onOpenChange,
  company,
}: ICompanyFormDialogProps) => {
  const [name, setName] = useState(company?.name ?? "");
  const [aliases, setAliases] = useState(company?.aliases?.join(", ") ?? "");
  const [careerPageUrl, setCareerPageUrl] = useState(
    company?.careerPageUrl ?? ""
  );
  const { isPending: isCreating, mutate: createCompany } =
    useAdminCreateCompany();
  const { isPending: isUpdating, mutate: updateCompany } =
    useAdminUpdateCompany();

  const isEditing = Boolean(company);
  const isPending = isCreating || isUpdating;

  const handleName = (event: ChangeEvent<HTMLInputElement>) =>
    setName(event.target.value);
  const handleAliases = (event: ChangeEvent<HTMLInputElement>) =>
    setAliases(event.target.value);
  const handleCareerPage = (event: ChangeEvent<HTMLInputElement>) =>
    setCareerPageUrl(event.target.value);

  const handleCancel = () => onOpenChange(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const dto: ICompanyInput = {
      name: name.trim(),
      aliases: aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter(Boolean),
      careerPageUrl: careerPageUrl.trim() || null,
    };
    const options = {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(isEditing ? "Company updated" : "Company created");
      },
    };

    if (company) {
      updateCompany({ ...dto, id: company.id }, options);
    } else {
      createCompany(dto, options);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit company" : "Create company"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this company entry."
              : "Add a company to the shared directory."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company-name">Name</Label>
            <Input
              id="company-name"
              onChange={handleName}
              placeholder="Company name"
              value={name}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company-aliases">Aliases</Label>
            <Input
              id="company-aliases"
              onChange={handleAliases}
              placeholder="Comma separated"
              value={aliases}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company-career-page">Career page URL</Label>
            <Input
              id="company-career-page"
              onChange={handleCareerPage}
              placeholder="https://example.com/careers"
              type="url"
              value={careerPageUrl}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleCancel} type="button" variant="outline">
              Cancel
            </Button>
            <AsyncButton
              disabled={!name.trim()}
              isLoading={isPending}
              type="submit"
            >
              {isEditing ? "Save" : "Create"}
            </AsyncButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const CompaniesPage = () => (
  <AppErrorSuspense fallback={DataTableSkeleton}>
    <CompaniesPageContent />
  </AppErrorSuspense>
);

const CompaniesPageContent = () => {
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
  } = useDataTableUrlState({ defaultSort: "name:asc" });
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ICompany | undefined>();

  const [firstSort] = sorting;
  const query: IAdminCompaniesQuery = {
    limit: pagination.pageSize,
    name: filters.name,
    page: pagination.pageIndex + 1,
    sort: firstSort
      ? `${firstSort.id}:${firstSort.desc ? "desc" : "asc"}`
      : undefined,
  };
  const { data, isPending } = useAdminCompanies(query);

  const companies = data ?? EMPTY_COMPANIES;
  // ponytail: /company returns no total; estimate one extra page when full.
  const rowCount =
    pagination.pageIndex * pagination.pageSize +
    companies.length +
    (companies.length === pagination.pageSize ? 1 : 0);

  const columns = useMemo<ColumnDef<typeof adminTableFeatures, ICompany>[]>(
    () => [
      ...baseColumns,
      {
        id: "actions",
        enableHiding: false,
        enableSorting: false,
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              aria-label="Edit company"
              // biome-ignore lint/performance/noJsxPropsBind: row callback
              onClick={() => {
                setEditing(row.original);
                setDialogOpen(true);
              }}
              size="icon-sm"
              variant="ghost"
            >
              <PencilLineIcon />
            </Button>
            <CompanyDeleteAction company={row.original} />
          </div>
        ),
      },
    ],
    []
  );

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading font-semibold text-xl">Companies</h1>
        <p className="text-muted-foreground text-sm">
          Manage the shared company directory.
        </p>
      </div>

      {isPending ? (
        <DataTableSkeleton />
      ) : (
        <DataTable
          columnFilters={columnFilters}
          columns={columns}
          columnVisibility={columnVisibility}
          data={companies}
          emptyMessage="No companies found."
          onColumnFiltersChange={setColumnFilters}
          onColumnVisibilityChange={setColumnVisibility}
          onPaginationChange={setPagination}
          onReset={reset}
          onSortingChange={setSorting}
          pagination={pagination}
          rowCount={rowCount}
          search={{
            value: filters.name ?? "",
            onChange: (value) => setFilter("name", value),
            placeholder: "Search companies",
          }}
          sorting={sorting}
          toolbar={
            <Button onClick={openCreate} size="sm">
              <PlusIcon />
              New company
            </Button>
          }
        />
      )}

      <CompanyFormDialog
        company={editing}
        key={editing?.id ?? "create"}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      />
    </div>
  );
};
