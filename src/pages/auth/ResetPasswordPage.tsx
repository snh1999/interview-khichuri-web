import { useSearchParams } from "react-router";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm.tsx";
import { LOGIN_PAGE } from "@/app.constants.ts";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <AuthLayout
        hideOauth
        hideFooter
        cardTitle="Invalid link"
        cardDescription="This password reset link is invalid or has already been used."
        footer={<LinkButton path={LOGIN_PAGE}>Back to log in</LinkButton>}
      />
    );
  }

  return (
    <AuthLayout
      hideOauth
      hideFooter
      cardTitle="Set new password"
      cardDescription="Choose a strong password for your account."
      footer={
        <>
          Remember your password?{" "}
          <LinkButton path={LOGIN_PAGE}>Log In</LinkButton>
        </>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
