import { TrashIcon } from "@phosphor-icons/react";
import { useDeletePasskey, useListPasskey } from "@/api/auth";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

export const PasskeyItems = () => {
  const { data: passkeys } = useListPasskey();
  const { mutateAsync: deletePasskey } = useDeletePasskey();

  return (
    <div className="space-y-6">
      {passkeys.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No passkeys yet</CardTitle>
            <CardDescription>
              Add your first passkey for secure, passwordless authentication.
            </CardDescription>
          </CardHeader>
        </Card>
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
                  action={() => deletePasskey(passkey.id)}
                  requireConfirmation
                  size="icon"
                  successMessage=""
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
