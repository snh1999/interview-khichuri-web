import { LOGIN_PAGE } from "@/app.constants.ts";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";

const ForgotPasswordPage = () => (
  <AuthLayout
    cardDescription="No worries! We will send you a link to your email to reset your password"
    cardTitle="Forgot your password"
    footer={
      <>
        Remember the password?
        <LinkButton path={LOGIN_PAGE}>Back to login</LinkButton>
      </>
    }
    hideFooter
    hideOauth
  >
    <ForgotPasswordForm />
  </AuthLayout>
);

export default ForgotPasswordPage;
