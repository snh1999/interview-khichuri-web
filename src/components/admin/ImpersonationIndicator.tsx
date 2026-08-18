import { SignOutIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router";
import { ADMIN_PAGE } from "@/app.constants.ts";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { authAdmin, useSession } from "@/lib/auth/auth-client.ts";

export const ImpersonationIndicator = () => {
  const navigate = useNavigate();
  const { data: session, refetch } = useSession();

  const handleStopImpersonation = () =>
    authAdmin.stopImpersonating(undefined, {
      onSuccess: () => {
        navigate(ADMIN_PAGE);
        refetch();
      },
    });

  if (!session?.session?.impersonatedBy) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AuthActionButton
        action={handleStopImpersonation}
        size="sm"
        successMessage="Stopped Impersonation"
        variant="destructive"
      >
        <SignOutIcon className="size-4" />
      </AuthActionButton>
    </div>
  );
};
