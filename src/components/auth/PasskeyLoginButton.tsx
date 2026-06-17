import { useEffect } from "react";
import { useNavigate } from "react-router";
import { HOMEPAGE } from "@/app.constants";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { signIn, useSession } from "@/lib/auth/auth-client.ts";

export const PasskeyButton = () => {
  const navigate = useNavigate();
  const { refetch } = useSession();

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
      action={() =>
        signIn.passkey(undefined, {
          onSuccess() {
            refetch();
            navigate(HOMEPAGE);
          },
        })
      }
      className="my-4 w-full"
      successMessage=""
      variant="outline"
    >
      Use Passkey
    </AuthActionButton>
  );
};
