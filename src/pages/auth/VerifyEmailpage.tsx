import { type ReactNode, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { verifyEmail } from "@/lib/auth/auth-client.ts";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";

type TVerificationState = "pending" | "success" | "error";

type TCardInformation = {
  title: string;
  description: string;
  Icon: ReactNode;
};

const cardInformation: Record<TVerificationState, TCardInformation> = {
  pending: {
    title: "Verifying your email",
    description: "Just a moment…",
    Icon: <Spinner />,
  },
  success: {
    title: "Email verified",
    description: "Your account is active. Redirecting you to homepage…",
    Icon: (
      <CheckCircleIcon className="h-6 w-6 text-emerald-500" weight="fill" />
    ),
  },
  error: {
    title: "Verification failed",
    description: "",
    Icon: <XCircleIcon className="text-destructive h-6 w-6" weight="fill" />,
  },
} as const;

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [state, setState] = useState<TVerificationState>(
    token ? "pending" : "error"
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    token ? "" : "No verification token found. The link may be invalid."
  );

  useEffect(() => {
    if (!token) {
      return;
    }
    const verify = async (): Promise<void> => {
      try {
        const { error } = await verifyEmail({ query: { token } });
        if (error) {
          setState("error");
          setErrorMessage(
            error.message ?? "Verification failed. The link may have expired."
          );
          return;
        }

        setState("success");
      } catch {
        setState("error");
        setErrorMessage("Network error. Please try again.");
      }
    };

    void verify();
  }, [token]);

  useEffect(() => {
    if (state !== "success") return;
    const timer = setTimeout(() => navigate("/"), 3000);
    return () => clearTimeout(timer);
  }, [state, navigate]);

  const { title, Icon, description } = cardInformation[state];

  return (
    <AuthLayout hideOauth cardTitle="" cardDescription="">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          {Icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {state === "error" ? errorMessage : description}
        </CardDescription>
      </CardHeader>

      {state === "error" && (
        <CardContent className="mt-4 flex items-center justify-around">
          <LinkButton
            pop
            path="/login"
            className="text-muted-foreground hover:text-foreground"
          >
            Back to log in
          </LinkButton>
          <LinkButton path="/register">Register again</LinkButton>
        </CardContent>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
