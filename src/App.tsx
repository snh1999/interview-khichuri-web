import { Navigate, Outlet, Route, Routes } from "react-router";
import {
  ACCOUNT_VERIFICATION_PAGE,
  ADMIN_LOOKUPS_PAGE,
  ADMIN_PAGE,
  CONFIRM_LOGIN_PAGE,
  EMAIL_REDIRECT_PAGE,
  FORGOT_PASSWORD_PAGE,
  HOMEPAGE,
  JOB_DETAIL_PAGE,
  JOBS_PAGE,
  LANDING_PAGE,
  LOGIN_PAGE,
  PROFILE_PAGE,
  REGISTER_PAGE,
  RESET_PASSWORD_PAGE,
  SESSION_DETAIL_PAGE,
  SESSIONS_PAGE,
  SETTINGS_PAGE,
} from "@/app.constants.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useSession } from "@/lib/auth/auth-client.ts";
import AdminPage from "@/pages/admin/AdminPage.tsx";
import ConfirmLoginPage from "@/pages/auth/ConfirmLogin.tsx";
import EmailRedirectPage from "@/pages/auth/EmailRedirectPage.tsx";
import ForgotPasswordPage from "@/pages/auth/FogotPasswordPage.tsx";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.tsx";
import VerifyEmailPage from "@/pages/auth/VerifyEmailpage.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import { EmptyPage } from "@/pages/EmptyPage.tsx";
import { JobDetailPage } from "@/pages/JobDetailPage.tsx";
import JobProfilePage from "@/pages/JobProfilePage.tsx";
import { JobsPage } from "@/pages/JobsPage.tsx";
import { LandingPage } from "@/pages/landing/LandingPage.tsx";
import { SessionsPage } from "@/pages/SessionsPage.tsx";
import SettingsPage from "@/pages/SettingsPage.tsx";
import { SidebarLayout } from "@/pages/SidebarLayout.tsx";
import { ResumeEditorWithPreviewPage } from "./pages/ResumeEditorWithPreviewPage";
import { SessionDetailPage } from "./pages/SessionDetailPage";

const App = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Spinner />;
  }

  return (
    <Routes>
      <Route element={<VerifyEmailPage />} path={ACCOUNT_VERIFICATION_PAGE} />
      <Route element={<ResetPasswordPage />} path={RESET_PASSWORD_PAGE} />

      <Route element={<PublicResumePage />} path={PUBLIC_RESUME_PAGE} />
      <Route element={<ExtractPreviewDemoPage />} path="/preview/extract" />

      <Route
        element={session ? <Navigate replace to={HOMEPAGE} /> : <Outlet />}
      >
        <Route element={<LandingPage />} path={LANDING_PAGE} />
        <Route element={<LoginPage />} path={LOGIN_PAGE} />
        <Route element={<RegisterPage />} path={REGISTER_PAGE} />
        <Route element={<EmailRedirectPage />} path={EMAIL_REDIRECT_PAGE} />
        <Route element={<ForgotPasswordPage />} path={FORGOT_PASSWORD_PAGE} />
        <Route element={<ConfirmLoginPage />} path={CONFIRM_LOGIN_PAGE} />
      </Route>

      <Route
        element={session ? <Outlet /> : <Navigate replace to={LOGIN_PAGE} />}
      >
        <Route element={<AdminPage />} path={ADMIN_PAGE} />

        <Route element={<SidebarLayout />}>
          <Route element={<DashboardPage />} path={HOMEPAGE} />
          <Route element={<JobDetailPage />} path={JOB_DETAIL_PAGE} />
          <Route element={<JobsPage />} path={JOBS_PAGE} />
          <Route element={<SessionsPage />} path={SESSIONS_PAGE} />
          <Route element={<SessionDetailPage />} path={SESSION_DETAIL_PAGE} />
          <Route element={<JobProfilePage />} path={PROFILE_PAGE} />
          <Route element={<SettingsPage />} path={SETTINGS_PAGE} />
        </Route>
      </Route>

      <Route element={<EmptyPage />} path="/*" />
    </Routes>
  );
};

export default App;
