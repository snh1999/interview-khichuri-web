import { REGISTER_PAGE } from "@/app.constants";
import { AuthLayout } from "@/components/auth/AuthLayout.tsx";
import { LoginForm } from "@/components/auth/login/LoginForm.tsx";
import { PasskeyButton } from "@/components/auth/PasskeyLoginButton.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";

const LoginPage = () => (
  <AuthLayout
    cardDescription="Sign in to your account to continue preparing"
    cardTitle="Welcome back"
    footer={
      <>
        Don&#39;t have an account?
        <LinkButton path={REGISTER_PAGE}>Create one</LinkButton>
      </>
    }
  >
    <LoginForm />
    <PasskeyButton />
  </AuthLayout>
);

export default LoginPage;
