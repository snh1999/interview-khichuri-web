import { LOGIN_PAGE } from "@/app.constants";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { RegisterForm } from "@/components/auth/register/RegisterForm.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";

const RegisterPage = () => (
  <AuthLayout
    cardDescription="Sign up to start preparing for your interviews"
    cardTitle="Create an account"
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
