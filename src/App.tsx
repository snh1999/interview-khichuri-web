import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import {
  ACCOUNT_VERIFICATION_PAGE,
  ADMIN_COMPANIES_PAGE,
  ADMIN_FEEDBACK_PAGE,
  ADMIN_JOBS_PAGE,
  ADMIN_LOOKUPS_PAGE,
  ADMIN_PAGE,
  ADMIN_PROMPTS_PAGE,
  ADMIN_USERS_PAGE,
  COMPANIES_PAGE,
  COMPANY_DETAIL_PAGE,
  CONFIRM_LOGIN_PAGE,
  EMAIL_REDIRECT_PAGE,
  FORGOT_PASSWORD_PAGE,
  HOMEPAGE,
  INTERVIEW_PAGE,
  JOB_DETAIL_PAGE,
  JOBS_PAGE,
  LANDING_PAGE,
  LOGIN_PAGE,
  NOTES_PAGE,
  PORTFOLIO_EDITOR_PAGE,
  PROFILE_PAGE,
  PUBLIC_RESUME_PAGE,
  REGISTER_PAGE,
  RESET_PASSWORD_PAGE,
  RESUME_DETAIL_PAGE,
  RESUME_EDITOR_PAGE,
  RESUMES_PAGE,
  SESSION_DETAIL_PAGE,
  SESSIONS_PAGE,
  SETTINGS_PAGE,
} from "@/app.constants.ts";
import { AdminGuard } from "@/components/admin/AdminGuard.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useLocalDataOnLogin } from "@/hooks/useLocalDataOnLogin.ts";
import { useSession } from "@/lib/auth/auth-client.ts";
import ConfirmLoginPage from "@/pages/auth/ConfirmLogin.tsx";
import EmailRedirectPage from "@/pages/auth/EmailRedirectPage.tsx";
import ForgotPasswordPage from "@/pages/auth/FogotPasswordPage.tsx";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.tsx";
import VerifyEmailPage from "@/pages/auth/VerifyEmailpage.tsx";
import { CompaniesPage } from "@/pages/CompaniesPage.tsx";
import { CompanyDetailPage } from "@/pages/CompanyDetailPage.tsx";
import { DashboardPage } from "@/pages/DashboardPage.tsx";
import { EmptyPage } from "@/pages/EmptyPage.tsx";
import { JobDetailPage } from "@/pages/JobDetailPage.tsx";
import { JobsPage } from "@/pages/JobsPage.tsx";
import { LandingPage } from "@/pages/LandingPage.tsx";
import { NotesPage } from "@/pages/NotesPage.tsx";
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

const AdminLayout = lazy(() =>
  import("@/pages/admin/AdminLayout.tsx").then((m) => ({
    default: m.AdminLayout,
  }))
);

const AdminOverviewPage = lazy(() =>
  import("@/pages/admin/AdminOverviewPage.tsx").then((m) => ({
    default: m.AdminOverviewPage,
  }))
);

const AdminPromptsPage = lazy(() =>
  import("@/pages/admin/PromptsPage.tsx").then((m) => ({
    default: m.PromptsPage,
  }))
);

const AdminCompaniesPage = lazy(() =>
  import("@/pages/admin/CompaniesPage.tsx").then((m) => ({
    default: m.CompaniesPage,
  }))
);

const AdminJobsPage = lazy(() => import("@/pages/admin/AdminJobsPage.tsx"));

const UsersPage = lazy(() =>
  import("@/pages/admin/UsersPage.tsx").then((m) => ({
    default: m.UsersPage,
  }))
);

const AdminFeedbackPage = lazy(() =>
  import("@/pages/admin/FeedbackPage.tsx").then((m) => ({
    default: m.FeedbackPage,
  }))
);

const LookupsPage = lazy(() => import("@/pages/admin/LookupsPage.tsx"));

const PortfolioEditorPage = lazy(() =>
  import("@/pages/PortfolioEditorPage.tsx").then((m) => ({
    default: m.PortfolioEditorPage,
  }))
);

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
        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route element={<AdminOverviewPage />} path={ADMIN_PAGE} />
            <Route element={<UsersPage />} path={ADMIN_USERS_PAGE} />
            <Route element={<AdminPromptsPage />} path={ADMIN_PROMPTS_PAGE} />
            <Route
              element={<AdminCompaniesPage />}
              path={ADMIN_COMPANIES_PAGE}
            />
            <Route element={<AdminJobsPage />} path={ADMIN_JOBS_PAGE} />
            <Route element={<AdminFeedbackPage />} path={ADMIN_FEEDBACK_PAGE} />
            <Route element={<LookupsPage />} path={ADMIN_LOOKUPS_PAGE} />
          </Route>
        </Route>

        <Route element={<SidebarLayout />}>
          <Route element={<DashboardPage />} path={HOMEPAGE} />
          <Route element={<JobDetailPage />} path={JOB_DETAIL_PAGE} />
          <Route element={<JobsPage />} path={JOBS_PAGE} />
          <Route element={<CompaniesPage />} path={COMPANIES_PAGE} />
          <Route element={<CompanyDetailPage />} path={COMPANY_DETAIL_PAGE} />
          <Route element={<SessionsPage />} path={SESSIONS_PAGE} />
          <Route element={<SessionDetailPage />} path={SESSION_DETAIL_PAGE} />
          <Route element={<NotesPage />} path={NOTES_PAGE} />
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

        <Route element={<SidebarLayout hideSidebar />}>
          <Route
            element={
              <Suspense fallback={<Spinner />}>
                <InterviewPage />
              </Suspense>
            }
            path={INTERVIEW_PAGE}
          />

          <Route
            element={
              <Suspense fallback={<Spinner />}>
                <ResumeEditorWithPreviewPage />
              </Suspense>
            }
            path={RESUME_EDITOR_PAGE}
          />
          <Route
            element={
              <Suspense fallback={<Spinner />}>
                <PortfolioEditorPage />
              </Suspense>
            }
            path={PORTFOLIO_EDITOR_PAGE}
          />
        </Route>
      </Route>

      <Route element={<EmptyPage />} path="/*" />
    </Routes>
  );
};

export default App;
