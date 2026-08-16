import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { HOMEPAGE, LOGIN_PAGE, REGISTER_PAGE } from "@/app.constants.ts";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { verifyEmail } from "@/lib/auth/auth-client.ts";

type TVerificationState = "pending" | "success" | "error";

interface ICardInformation {
  title: string;
  description: string;
  icon: ReactNode;
}

const cardInformation: Record<TVerificationState, ICardInformation> = {
  pending: {
    title: "Verifying your email",
    description: "Just a moment…",
    icon: <Spinner />,
  },
  success: {
    title: "Email verified",
    description: "Your account is active. Redirecting you to homepage…",
    icon: (
      <CheckCircleIcon className="h-6 w-6 text-emerald-500" weight="fill" />
    ),
  },
  error: {
    title: "Verification failed",
    description: "",
    icon: <XCircleIcon className="h-6 w-6 text-destructive" weight="fill" />,
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

    verify();
  }, [token]);

  useEffect(() => {
    if (state !== "success") {
      return;
    }
    const timer = setTimeout(() => navigate(HOMEPAGE), 3000);
    return () => clearTimeout(timer);
  }, [state, navigate]);

  const { title, icon, description } = cardInformation[state];

  return (
    <AuthLayout cardDescription="" cardTitle="" hideOauth>
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {/** biome-ignore lint/suspicious/noLeakedRender: <> */}
          {state === "error" ? errorMessage : description}
        </CardDescription>
      </CardHeader>

      {state === "error" && (
        <CardContent className="mt-4 flex items-center justify-around">
          <LinkButton
            className="text-muted-foreground hover:text-foreground"
            path={LOGIN_PAGE}
            pop
          >
            Back to log in
          </LinkButton>
          <LinkButton path={REGISTER_PAGE}>Register again</LinkButton>
        </CardContent>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
