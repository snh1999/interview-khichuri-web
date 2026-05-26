import { useEffect } from "react";
import { useNavigate } from "react-router";
import { signIn, useSession } from "@/lib/auth/auth-client.ts";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { HOMEPAGE } from "@/app.constants";

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
      variant="outline"
      className="my-4 w-full"
      action={() =>
        signIn.passkey(undefined, {
          onSuccess() {
            refetch();
            navigate("/");
          },
        })
      }
      successMessage=""
    >
      Use Passkey
    </AuthActionButton>
  );
};
