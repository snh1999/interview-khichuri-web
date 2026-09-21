import { LOGIN_PAGE } from "@/app.constants.ts";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";

const ForgotPasswordPage = () => (
  <AuthLayout
    cardDescription="We'll email you a link to reset your password."
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
