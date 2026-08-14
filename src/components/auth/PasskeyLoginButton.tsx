import { useEffect } from "react";
import { useNavigate } from "react-router";
import { HOMEPAGE } from "@/app.constants";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { signIn, useSession } from "@/lib/auth/auth-client.ts";

export const PasskeyButton = () => {
  const navigate = useNavigate();
  // TODO: use react query
  const { refetch } = useSession();
  const handleSignIn = () =>
    signIn.passkey(undefined, {
      onSuccess() {
        refetch();
        navigate(HOMEPAGE);
      },
    });

  useEffect(() => {
    signIn.passkey(
      { autoFill: true },
      {
        onSuccess() {
          refetch();
          navigate(HOMEPAGE);
        },
      }
    );
  }, [navigate, refetch]);

  return (
    <AuthActionButton
      action={handleSignIn}
      className="my-4 w-full"
      successMessage=""
      variant="outline"
    >
      Use Passkey
    </AuthActionButton>
  );
};
