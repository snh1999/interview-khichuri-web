import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import {
  ACCOUNT_VERIFICATION_PAGE,
  ADMIN_PAGE,
  CONFIRM_LOGIN_PAGE,
  EMAIL_REDIRECT_PAGE,
  FORGOT_PASSWORD_PAGE,
  HOMEPAGE,
  INTERVIEW_PAGE,
  JOB_DETAIL_PAGE,
  JOBS_PAGE,
  LOGIN_PAGE,
  NOTES_PAGE,
  PROFILE_PAGE,
  PUBLIC_RESUME_PAGE,
  REGISTER_PAGE,
  RESET_PASSWORD_PAGE,
  RESUME_DETAIL_PAGE,
  RESUME_EDITOR_PAGE,
  RESUMES_PAGE,
  SCHEDULE_PAGE,
  SESSION_DETAIL_PAGE,
  SESSIONS_PAGE,
  SETTINGS_PAGE,
} from "@/app.constants.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useLocalDataOnLogin } from "@/hooks/useLocalDataOnLogin.ts";
import { useSession } from "@/lib/auth/auth-client.ts";
import AdminPage from "@/pages/admin/AdminPage.tsx";
import ConfirmLoginPage from "@/pages/auth/ConfirmLogin.tsx";
import EmailRedirectPage from "@/pages/auth/EmailRedirectPage.tsx";
import ForgotPasswordPage from "@/pages/auth/FogotPasswordPage.tsx";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.tsx";
import VerifyEmailPage from "@/pages/auth/VerifyEmailpage.tsx";
import { DashboardPage } from "@/pages/DashboardPage.tsx";
import { EmptyPage } from "@/pages/EmptyPage.tsx";
import { JobDetailPage } from "@/pages/JobDetailPage.tsx";
import { JobsPage } from "@/pages/JobsPage.tsx";
import { NotesPage } from "@/pages/NotesPage.tsx";
import { SchedulePage } from "@/pages/SchedulePage.tsx";
import { SessionsPage } from "@/pages/SessionsPage.tsx";
import SettingsPage from "@/pages/SettingsPage.tsx";
import { SidebarLayout } from "@/pages/SidebarLayout.tsx";
import { SessionDetailPage } from "./pages/SessionDetailPage";

const PublicResumePage = lazy(() =>
  import("@/pages/PublicResumePage.tsx").then((m) => ({
    default: m.PublicResumePage,
  }))
);

const ResumeEditorWithPreviewPage = lazy(() =>
  import("./pages/ResumeEditorWithPreviewPage").then((m) => ({
    default: m.ResumeEditorWithPreviewPage,
  }))
);

const InterviewPage = lazy(() =>
  import("@/pages/InterviewPage.tsx").then((m) => ({
    default: m.InterviewPage,
  }))
);

const ResumeDetailPage = lazy(() =>
  import("@/pages/ResumeDetailPage.tsx").then((m) => ({
    default: m.ResumeDetailPage,
  }))
);

const ResumesPage = lazy(() =>
  import("@/pages/ResumesPage.tsx").then((m) => ({
    default: m.ResumesPage,
  }))
);

const JobProfilePage = lazy(() => import("@/pages/JobProfilePage.tsx"));

const App = () => {
  const { data: session, isPending } = useSession();
  const { isSwapping } = useLocalDataOnLogin(session?.user?.id);

  if (isPending || isSwapping) {
    return <Spinner />;
  }

  return (
    <Routes>
      <Route element={<VerifyEmailPage />} path={ACCOUNT_VERIFICATION_PAGE} />
      <Route element={<ResetPasswordPage />} path={RESET_PASSWORD_PAGE} />

      <Route
        element={
          <Suspense fallback={<Spinner />}>
            <PublicResumePage />
          </Suspense>
        }
        path={PUBLIC_RESUME_PAGE}
      />

      <Route
        element={session ? <Navigate replace to={HOMEPAGE} /> : <Outlet />}
      >
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
          <Route
            element={
              <Suspense fallback={<Spinner />}>
                <InterviewPage />
              </Suspense>
            }
            path={INTERVIEW_PAGE}
          />
          <Route element={<NotesPage />} path={NOTES_PAGE} />
          <Route element={<SchedulePage />} path={SCHEDULE_PAGE} />
          <Route
            element={
              <Suspense fallback={<Spinner />}>
                <JobProfilePage />
              </Suspense>
            }
            path={PROFILE_PAGE}
          />
          <Route element={<SettingsPage />} path={SETTINGS_PAGE} />
          <Route
            element={
              <Suspense fallback={<Spinner />}>
                <ResumesPage />
              </Suspense>
            }
            path={RESUMES_PAGE}
          />
          <Route
            element={
              <Suspense fallback={<Spinner />}>
                <ResumeDetailPage />
              </Suspense>
            }
            path={RESUME_DETAIL_PAGE}
          />
        </Route>
        <Route
          element={
            <Suspense fallback={<Spinner />}>
              <ResumeEditorWithPreviewPage />
            </Suspense>
          }
          path={RESUME_EDITOR_PAGE}
        />
      </Route>

      <Route element={<EmptyPage />} path="/*" />
    </Routes>
  );
};

export default App;
