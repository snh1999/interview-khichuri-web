import { DotsThreeIcon } from "@phosphor-icons/react";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import type { IAdminUser } from "@/api/admin";
import {
  useBanUser,
  useImpersonateUser,
  useRemoveUser,
  useRevokeSessionByAdmin,
  useSetUserPassword,
  useSetUserRole,
  useUnbanUser,
  useVerifyUserEmail,
} from "@/api/auth/admin.ts";
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
import { ActionButton } from "@/components/ui/button/ActionButton.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

type TDialogMode = "ban" | "password" | null;
type TConfirmAction = "impersonate" | "revoke" | "role";

interface IProps {
  user: IAdminUser;
  isSelf: boolean;
  onViewDetails: (userId: string) => void;
}

export const UserActions = ({ user, isSelf, onViewDetails }: IProps) => {
  const impersonateUser = useImpersonateUser();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const removeUser = useRemoveUser();
  const revokeSessions = useRevokeSessionByAdmin();
  const setRole = useSetUserRole();
  const setUserPassword = useSetUserPassword();
  const verifyEmail = useVerifyUserEmail();

  const [mode, setMode] = useState<TDialogMode>(null);
  const [confirmAction, setConfirmAction] = useState<TConfirmAction | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("");
  const [password, setNewPassword] = useState("");

  const handlers = useMemo(
    () => ({
      ban: () => setMode("ban"),
      daysChange: (event: ChangeEvent<HTMLInputElement>) =>
        setDays(event.target.value),
      impersonate: () => setConfirmAction("impersonate"),
      password: () => setMode("password"),
      passwordChange: (event: ChangeEvent<HTMLInputElement>) =>
        setNewPassword(event.target.value),
      reasonChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
        setReason(event.target.value),
      remove: () => removeUser.mutate(user.id),
      revoke: () => setConfirmAction("revoke"),
      role: () => setConfirmAction("role"),
      unban: () => unbanUser.mutate(user.id),
      verify: () => verifyEmail.mutate(user.id),
      viewDetails: () => onViewDetails(user.id),
    }),
    [onViewDetails, removeUser, unbanUser, user.id, verifyEmail]
  );

  const confirmActions = {
    impersonate: async () => {
      await impersonateUser.mutateAsync(user.id);
      return "Impersonating user";
    },
    revoke: async () => {
      await revokeSessions.mutateAsync(user.id);
      return "Sessions revoked";
    },
    role: async () => {
      await setRole.mutateAsync({
        userId: user.id,
        role: user.role === "admin" ? "user" : "admin",
      });
      return "Role updated";
    },
  };

  const runConfirmedAction = async () => {
    if (!confirmAction) {
      return { error: false };
    }
    const message = await confirmActions[confirmAction]();
    setConfirmAction(null);
    return { error: false, message };
  };

  const confirmCopy = {
    impersonate: {
      title: "Impersonate this user?",
      description: `You will be signed in as ${user.name}.`,
      label: "Impersonate",
    },
    revoke: {
      title: "Revoke all sessions?",
      description: `Sign ${user.name} out of every active session.`,
      label: "Revoke",
    },
    role: {
      title: "Change user role?",
      description: `Change ${user.name}'s account role.`,
      label: user.role === "admin" ? "Make user" : "Make admin",
    },
  }[confirmAction ?? "impersonate"];

  const closeConfirm = (open: boolean) => {
    if (!open) {
      setConfirmAction(null);
    }
  };

  const closeDialog = (open: boolean) => {
    if (!open) {
      setMode(null);
      setReason("");
      setDays("");
      setNewPassword("");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "ban") {
      banUser.mutate(
        {
          userId: user.id,
          banReason: reason.trim() || undefined,
          banExpiresIn: days ? Number(days) * 86_400 : undefined,
        },
        { onSuccess: () => closeDialog(false) }
      );
      return;
    }
    if (mode === "password") {
      setUserPassword.mutate(
        { userId: user.id, newPassword: password },
        { onSuccess: () => closeDialog(false) }
      );
    }
  };

  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button aria-label="User actions" size="icon-sm" variant="ghost">
                <DotsThreeIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handlers.viewDetails}>
              View details
            </DropdownMenuItem>
            {isSelf ? null : (
              <>
                <DropdownMenuItem onClick={handlers.impersonate}>
                  Impersonate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlers.revoke}>
                  Revoke sessions
                </DropdownMenuItem>
                {user.banned ? (
                  <DropdownMenuItem onClick={handlers.unban}>
                    Unban user
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handlers.ban}>
                    Ban user
                  </DropdownMenuItem>
                )}
              </>
            )}
            <DropdownMenuItem onClick={handlers.role}>
              {user.role === "admin" ? "Make user" : "Make admin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlers.password}>
              Set password
            </DropdownMenuItem>
            {user.emailVerified ? null : (
              <DropdownMenuItem onClick={handlers.verify}>
                Verify email
              </DropdownMenuItem>
            )}
            {isSelf ? null : (
              <>
                <DropdownMenuSeparator />
                <AlertDialogTrigger
                  nativeButton={false}
                  render={
                    <DropdownMenuItem variant="destructive">
                      Delete user
                    </DropdownMenuItem>
                  }
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {user.name}&apos;s account and all of
              their sessions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handlers.remove}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={closeConfirm} open={confirmAction !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmCopy.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmCopy.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <ActionButton action={runConfirmedAction}>
              {confirmCopy.label}
            </ActionButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog onOpenChange={closeDialog} open={mode !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "ban" ? `Ban ${user.name}` : "Set password"}
            </DialogTitle>
            <DialogDescription>
              {mode === "ban"
                ? "The user is signed out of all sessions immediately."
                : `Set a new password for ${user.name}.`}
            </DialogDescription>
          </DialogHeader>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            {mode === "ban" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ban-reason">Reason</Label>
                  <Textarea
                    id="ban-reason"
                    onChange={handlers.reasonChange}
                    placeholder="Why is this user being banned?"
                    required
                    value={reason}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ban-days">Expires in days (optional)</Label>
                  <Input
                    id="ban-days"
                    min={1}
                    onChange={handlers.daysChange}
                    placeholder="Never"
                    type="number"
                    value={days}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  autoComplete="new-password"
                  id="new-password"
                  minLength={8}
                  onChange={handlers.passwordChange}
                  required
                  type="password"
                  value={password}
                />
              </div>
            )}

            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                }
              />
              <AsyncButton
                isLoading={banUser.isPending || setUserPassword.isPending}
                type="submit"
                variant={mode === "ban" ? "destructive" : "default"}
              >
                {mode === "ban" ? "Ban user" : "Set password"}
              </AsyncButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
