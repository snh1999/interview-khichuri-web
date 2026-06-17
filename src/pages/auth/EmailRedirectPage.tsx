import { useLocation } from "react-router";
import {
  type FORGOT_PASSWORD_EMAIL_CONTEXT,
  LOGIN_PAGE,
  VERIFY_EMAIL_CONTEXT,
} from "@/app.constants.ts";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { useEmailResendCooldown } from "@/hooks/useEmailResendCooldown.ts";
import { sendVerificationEmail } from "@/lib/auth/auth-client.ts";
import { EmptyPage } from "@/pages/EmptyPage.tsx";

type TPageContext =
  | typeof VERIFY_EMAIL_CONTEXT
  | typeof FORGOT_PASSWORD_EMAIL_CONTEXT;

interface IPageData {
  cardTitle: string;
  cardDescription: string;
  message: string;
  hideOauth: boolean;
  hideFooter: boolean;
}

const pageData: Record<TPageContext, IPageData> = {
  verifyAccount: {
    cardTitle: "Verify your email",
    cardDescription: "We sent a verification link to your email address.",
    message: "click the link to activate your account",
    hideOauth: false,
    hideFooter: false,
  },
  forgotpass: {
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

  if (!state) {
    return <EmptyPage />;
  }

  const email = state.email ?? "";
  const { cardTitle, cardDescription, message, hideOauth, hideFooter } =
    pageData[state.context ?? VERIFY_EMAIL_CONTEXT];

  const handleResend = async () => {
    const result = await sendVerificationEmail({
      email,
    });
    if (!result.error) {
      markSent();
    }
    return result;
  };

  return (
    <AuthLayout
      cardDescription={cardDescription}
      cardTitle={cardTitle}
      footer={
        <LinkButton className="pl-0" path={LOGIN_PAGE}>
          Back to log in
        </LinkButton>
      }
      hideFooter={hideFooter}
      hideOauth={hideOauth}
    >
      <p className="text-muted-foreground/70">
        Please check your email and {message}. Check your spam folder if you
        don&apos;t see it within a few minutes.
      </p>
      {email ? (
        <AuthActionButton
          action={handleResend}
          className="mt-4 w-full"
          disabled={cooldown > 0}
          successMessage="Verification email sent successfully"
        >
          Resend Email {cooldown ? `(${cooldown}s)` : ""}
        </AuthActionButton>
      ) : null}
    </AuthLayout>
  );
};

export default EmailRedirectPage;
