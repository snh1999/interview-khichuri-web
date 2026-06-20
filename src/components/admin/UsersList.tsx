import { UserIcon } from "@phosphor-icons/react";
import { useAdminListUsers } from "@/api/auth/admin.ts";
import { UserRow } from "@/components/admin/UsersRow.tsx";
import { AppPagination } from "@/components/common/AppPagination.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination.ts";

const PAGE_SIZE = 5;
export const UsersList = () => {
  const { limit, page } = usePagination(PAGE_SIZE);
  const { data: usersData } = useAdminListUsers({ page, limit });

  const from = usersData?.total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, usersData?.total ?? 0);

  if (!usersData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Users
          </div>
          <span className="text-muted-foreground/70 text-xs italic">
            Showing <strong>{from}</strong>–<strong>{to}</strong> of{" "}
            <strong>{usersData.total}</strong>
          </span>
        </CardTitle>

        <CardDescription>
          Manage user accounts, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>

                <TableHead>Created</TableHead>
                <TableHead className="w-25">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </TableBody>
          </Table>
        </div>

        <AppPagination defaultPageLimit={PAGE_SIZE} total={usersData.total} />
      </CardContent>
    </Card>
  );
};
