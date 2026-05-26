import { LoginForm } from "@/components/auth/login/LoginForm.tsx";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { PasskeyButton } from "@/components/auth/PasskeyLoginButton.tsx";
import { REGISTER_PAGE } from "@/app.constants";

const LoginPage = () => {
  return (
    <AuthLayout
      cardTitle="Welcome back"
      cardDescription="Sign in to your account to continue preparing"
      footer={
        <>
          Don&#39;t have an account?
          <LinkButton path={REGISTER_PAGE}>Create one</LinkButton>
        </>
      }
    >
      <>
        <LoginForm />
        <PasskeyButton />
      </>
    </AuthLayout>
  );
};

export default LoginPage;
