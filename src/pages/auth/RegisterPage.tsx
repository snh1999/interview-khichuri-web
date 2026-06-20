import { LOGIN_PAGE } from "@/app.constants";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { RegisterForm } from "@/components/auth/register/RegisterForm.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";

const RegisterPage = () => (
  <AuthLayout
    cardDescription="Sign in to your account to continue preparing"
    cardTitle="Welcome back"
    footer={
      <>
        Already have an account?
        <LinkButton path={LOGIN_PAGE}>Log In</LinkButton>
      </>
    }
  >
    <RegisterForm />
  </AuthLayout>
);

export default RegisterPage;
