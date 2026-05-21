import { RegisterForm } from "@/components/auth/register/RegisterForm.tsx";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { LOGIN_PAGE } from "@/app.constants";

const RegisterPage = () => {
  return (
    <AuthLayout
      cardTitle="Welcome back"
      cardDescription="Sign in to your account to continue preparing"
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
};

export default RegisterPage;
