import { TrashIcon } from "@phosphor-icons/react";
import { useDeletePasskey, useListPasskey } from "@/api/auth";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";

export const PasskeyItems = () => {
  const { data: passkeys } = useListPasskey();
  const { mutateAsync: deletePasskey } = useDeletePasskey();

  return (
    <div className="space-y-6">
      {passkeys.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No linked accounts</EmptyTitle>
            <EmptyDescription>
              Link an account to sign in without a password.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {passkeys.map((passkey) => (
            <Card key={passkey.id}>
              <CardHeader className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle>{passkey.name}</CardTitle>
                  <CardDescription>
                    Created {new Date(passkey.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <AuthActionButton
                  // biome-ignore lint/performance/noJsxPropsBind: <>
                  action={() => deletePasskey(passkey.id)}
                  actionLabel="Delete passkey"
                  aria-label="Delete passkey"
                  dialogDescription="You won't be able to sign in with this passkey after it's deleted."
                  dialogTitle="Delete this passkey?"
                  requireConfirmation
                  size="icon"
                  successMessage="Passkey deleted"
                  variant="destructive"
                >
                  <TrashIcon />
                </AuthActionButton>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
