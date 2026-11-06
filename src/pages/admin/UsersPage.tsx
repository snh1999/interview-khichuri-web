import type { ColumnDef, ColumnVisibilityState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import {
  type IAdminUser,
  useAdminUsersQuery,
  useAdminUsersQueryParams,
} from "@/api/admin";
import {
  type adminTableFeatures,
  DataTable,
  DataTableSkeleton,
} from "@/components/admin/data-table/data-table.tsx";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header.tsx";
import { DataTableFilterSelect } from "@/components/admin/data-table/data-table-filter-select.tsx";
import { useDataTableUrlState } from "@/components/admin/data-table/use-data-table-url-state.ts";
import { UserActions } from "@/components/admin/UserActions.tsx";
import { UserDetailSheet } from "@/components/admin/UserDetailSheet.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useSession } from "@/lib/auth/auth-client.ts";
import { formatDate } from "@/lib/date";

const EMPTY_USERS: IAdminUser[] = [];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const baseColumns: ColumnDef<typeof adminTableFeatures, IAdminUser>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {user.image ? (
              <AvatarImage alt={user.name} src={user.image} />
            ) : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.role === "admin" ? "default" : "secondary"}>
        {row.original.role ?? "user"}
      </Badge>
    ),
  },
  {
    accessorKey: "emailVerified",
    id: "verified",
    enableSorting: false,
    header: "Verified",
    cell: ({ row }) =>
      row.original.emailVerified ? (
        <Badge variant="secondary">Verified</Badge>
      ) : (
        <Badge variant="outline">Unverified</Badge>
      ),
  },
  {
    accessorKey: "banned",
    id: "banned",
    enableSorting: false,
    header: "Banned",
    cell: ({ row }) =>
      row.original.banned ? (
        <Badge variant="destructive">Banned</Badge>
      ) : (
        <Badge variant="outline">Active</Badge>
      ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

const booleanOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export const UsersPage = () => (
  <AppErrorSuspense fallback={DataTableSkeleton}>
    <UsersPageContent />
  </AppErrorSuspense>
);

const UsersPageContent = () => {
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
  const [selectedUserId, setSelectedUserId] = useState<string>();

  const { data: session } = useSession();
  const currentUserId = session?.user.id;

  const query = useAdminUsersQueryParams();
  const { data, isPending } = useAdminUsersQuery(query);

  const columns = useMemo<ColumnDef<typeof adminTableFeatures, IAdminUser>[]>(
    () => [
      ...baseColumns,
      {
        id: "actions",
        enableHiding: false,
        enableSorting: false,
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <UserActions
              isSelf={row.original.id === currentUserId}
              onViewDetails={setSelectedUserId}
              user={row.original}
            />
          </div>
        ),
      },
    ],
    [currentUserId]
  );

  const handleDetailOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelectedUserId(undefined);
    }
  }, []);

  const handleSearch = (value: string) => setFilter("q", value);
  const handleRole = (value: string) => setFilter("role", value);
  const handleBanned = (value: string) => setFilter("banned", value);
  const handleVerified = (value: string) => setFilter("verified", value);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Users</h1>
        <p className="text-muted-foreground text-sm">
          Manage user accounts, roles, and permissions.
        </p>
      </div>

      {isPending ? (
        <DataTableSkeleton />
      ) : (
        <DataTable
          columnFilters={columnFilters}
          columns={columns}
          columnVisibility={columnVisibility}
          data={data?.users ?? EMPTY_USERS}
          emptyMessage="No users match these filters."
          onColumnFiltersChange={setColumnFilters}
          onColumnVisibilityChange={setColumnVisibility}
          onPaginationChange={setPagination}
          onReset={reset}
          onSortingChange={setSorting}
          pagination={pagination}
          rowCount={data?.total ?? 0}
          search={{
            value: filters.q ?? "",
            onChange: handleSearch,
            placeholder: "Search name or email",
          }}
          sorting={sorting}
          toolbar={
            <>
              <DataTableFilterSelect
                allLabel="All roles"
                label="Role"
                onChange={handleRole}
                options={roleOptions}
                value={filters.role ?? ""}
              />
              <DataTableFilterSelect
                allLabel="Any"
                label="Banned"
                onChange={handleBanned}
                options={booleanOptions}
                value={filters.banned ?? ""}
              />
              <DataTableFilterSelect
                allLabel="Any"
                label="Verified"
                onChange={handleVerified}
                options={booleanOptions}
                value={filters.verified ?? ""}
              />
            </>
          }
        />
      )}

      <UserDetailSheet
        onOpenChange={handleDetailOpenChange}
        open={Boolean(selectedUserId)}
        userId={selectedUserId}
      />
    </div>
  );
};
