import { useSearchParams } from "react-router";
import { LOGIN_PAGE } from "@/app.constants.ts";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <AuthLayout
        cardDescription="This password reset link is invalid or has already been used."
        cardTitle="Invalid link"
        footer={<LinkButton path={LOGIN_PAGE}>Back to log in</LinkButton>}
        hideFooter
        hideOauth
      />
    );
  }

  return (
    <AuthLayout
      cardDescription="Choose a strong password for your account."
      cardTitle="Set new password"
      footer={
        <>
          Remember your password?{" "}
          <LinkButton path={LOGIN_PAGE}>Log In</LinkButton>
        </>
      }
      hideFooter
      hideOauth
    >
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
