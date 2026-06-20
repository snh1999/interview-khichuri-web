import { DotsThreeIcon } from "@phosphor-icons/react";
import type { UserWithRole } from "better-auth/client/plugins";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  useBanUser,
  useRemoveUser,
  useRevokeSessionByAdmin,
  useUnbanUser,
} from "@/api/auth/admin.ts";
import { HOMEPAGE } from "@/app.constants.ts";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { authAdmin, useSession } from "@/lib/auth/auth-client.ts";
import { cn } from "@/lib/utils.ts";

interface IProps {
  user: UserWithRole;
}

export const UserRow = ({ user }: Readonly<IProps>) => {
  const { data: session, refetch } = useSession();
  const navigate = useNavigate();

  const { mutate: banUser } = useBanUser();
  const { mutate: unbanUser } = useUnbanUser();
  const { mutate: revokeUserSession } = useRevokeSessionByAdmin();
  const { mutate: removeUser } = useRemoveUser();

  const isSelf = user.id === session?.user.id;

  function handleImpersonateUser(userId: string) {
    authAdmin.impersonateUser(
      { userId },
      {
        onError: (error) => {
          toast.error(error.error.message || "Failed to impersonate");
        },
        onSuccess: async () => {
          await refetch();
          navigate(HOMEPAGE);
        },
      }
    );
  }

  return (
    <TableRow key={user.id}>
      <TableCell>
        <div>
          <div
            className={cn(
              user.banned && "text-destructive",
              "mb-1 flex items-center gap-5 font-medium text-sm"
            )}
          >
            {user.name}
            {user.banned ? <Badge variant="destructive">Banned</Badge> : null}
          </div>
          <div className="text-muted-foreground text-sm">{user.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="not-empty:mt-2 flex items-center gap-2">
          {user.emailVerified ? (
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role}
            </Badge>
          ) : (
            <Badge variant="outline">Unverified</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        {isSelf ? (
          <Badge>You</Badge>
        ) : (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="icon" variant="ghost">
                    <DotsThreeIcon />
                  </Button>
                }
              />
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleImpersonateUser(user.id)}
                >
                  Impersonate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => revokeUserSession(user.id)}>
                  Revoke Sessions
                </DropdownMenuItem>
                {user.banned ? (
                  <DropdownMenuItem onClick={() => unbanUser(user.id)}>
                    Unban User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => banUser(user.id)}>
                    Ban User
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />

                <AlertDialogTrigger
                  render={
                    <DropdownMenuItem variant="destructive">
                      Delete User
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => removeUser(user.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
    </TableRow>
  );
};
