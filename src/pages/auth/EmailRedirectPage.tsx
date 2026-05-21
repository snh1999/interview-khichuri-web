import { useLocation } from "react-router";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { sendVerificationEmail } from "@/lib/auth/auth-client.ts";
import { useEmailResendCooldown } from "@/hooks/useEmailResendCooldown.ts";
import {
  FORGOT_PASSWORD_EMAIL_CONTEXT,
  VERIFY_EMAIL_CONTEXT,
} from "@/app.constants.ts";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { EmptyPage } from "@/pages/EmptyPage.tsx";

type TPageContext =
  | typeof VERIFY_EMAIL_CONTEXT
  | typeof FORGOT_PASSWORD_EMAIL_CONTEXT;

type TPageData = {
  cardTitle: string;
  cardDescription: string;
  message: string;
  hideOauth: boolean;
  hideFooter: boolean;
};

const pageData: Record<TPageContext, TPageData> = {
  verifyAccount: {
    cardTitle: "Verify your email",
    cardDescription: "We sent a verification link to your email address.",
    message: "click the link to activate your account",
    hideOauth: false,
    hideFooter: false,
  },
  forgotPassword: {
    cardTitle: "Check your email",
    cardDescription: "We sent a the password reset link to your email address.",
    message: "follow the link to set a new password",
    hideOauth: true,
    hideFooter: true,
  },
} as const;

const EmailRedirectPage = () => {
  const location = useLocation();
  const state = location.state as {
    email?: string;
    context?: TPageContext;
  } | null;
  const { cooldown, markSent } = useEmailResendCooldown();

  if (!state) return <EmptyPage />;

  const email = state.email;
  const { cardTitle, cardDescription, message, hideOauth, hideFooter } =
    pageData[state.context ?? VERIFY_EMAIL_CONTEXT];

  const handleResend = async () => {
    const result = await sendVerificationEmail({
      email: email!,
    });
    if (!result.error) markSent();
    return result;
  };

  return (
    <AuthLayout
      cardTitle={cardTitle}
      cardDescription={cardDescription}
      hideOauth={hideOauth}
      hideFooter={hideFooter}
      footer={
        <LinkButton className="pl-0" path="/login">
          Back to log in
        </LinkButton>
      }
    >
      <p className="text-muted-foreground/70">
        Please check your email and {message}. Check your spam folder if you
        don&apos;t see it within a few minutes.
      </p>
      {email ? (
        <AuthActionButton
          className="mt-4 w-full"
          action={handleResend}
          successMessage="Verification email sent successfully"
          disabled={cooldown > 0}
        >
          Resend Email {cooldown ? `(${cooldown}s)` : ""}
        </AuthActionButton>
      ) : null}
    </AuthLayout>
  );
};

export default EmailRedirectPage;
