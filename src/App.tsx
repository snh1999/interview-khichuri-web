import { Navigate, Outlet, Route, Routes } from "react-router";
import { useSession } from "@/lib/auth/auth-client.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import EmailRedirectPage from "@/pages/auth/EmailRedirectPage.tsx";
import VerifyEmailPage from "@/pages/auth/VerifyEmailpage.tsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.tsx";
import {
  ACCOUNT_VERIFICATION_PAGE,
  FORGOT_PASSWORD_PAGE,
  EMAIL_REDIRECT_PAGE,
  RESET_PASSWORD_PAGE,
  LOGIN_PAGE,
  REGISTER_PAGE,
  CONFIRM_LOGIN_PAGE,
  HOMEPAGE,
  PROFILE_PAGE,
  ADMIN_PAGE,
} from "@/app.constants.ts";
import ForgotPasswordPage from "@/pages/auth/FogotPasswordPage.tsx";
import { EmptyPage } from "@/pages/EmptyPage.tsx";
import ProfilePage from "@/pages/ProfilePage.tsx";
import AdminPage from "@/pages/admin/AdminPage.tsx";
import ConfirmLoginPage from "@/pages/auth/ConfirmLogin.tsx";

const App = () => {
  const { data: session, isPending } = useSession();

  if (isPending) return <Spinner />;

  return (
    <Routes>
      <Route path={ACCOUNT_VERIFICATION_PAGE} element={<VerifyEmailPage />} />
      <Route path={RESET_PASSWORD_PAGE} element={<ResetPasswordPage />} />

      <Route
        element={!session ? <Outlet /> : <Navigate to={HOMEPAGE} replace />}
      >
        <Route path={LOGIN_PAGE} element={<LoginPage />} />
        <Route path={REGISTER_PAGE} element={<RegisterPage />} />
        <Route path={EMAIL_REDIRECT_PAGE} element={<EmailRedirectPage />} />
        <Route path={FORGOT_PASSWORD_PAGE} element={<ForgotPasswordPage />} />
        <Route path={CONFIRM_LOGIN_PAGE} element={<ConfirmLoginPage />} />
      </Route>

      <Route
        element={session ? <Outlet /> : <Navigate to={LOGIN_PAGE} replace />}
      >
        <Route path={HOMEPAGE} element={<DashboardPage />} />
        <Route path={PROFILE_PAGE} element={<ProfilePage />} />
        <Route path={ADMIN_PAGE} element={<AdminPage />} />
        <Route path="/*" element={<EmptyPage />} />
      </Route>
    </Routes>
  );
};

export default App;
