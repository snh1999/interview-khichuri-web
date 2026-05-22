import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm.tsx";

const ForgotPasswordPage = () => {
  return (
    <AuthLayout
      hideOauth
      hideFooter
      cardTitle="Forgot your password"
      cardDescription="No worries! We will send you a link to your email to reset your password"
      footer={
        <>
          Rembmer the password?
          <LinkButton path="/register">Back to login</LinkButton>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
