import { Navigate, Outlet, Route, Routes } from "react-router";
import { useSession } from "@/lib/auth/auth-client.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import EmailRedirectPage from "@/pages/auth/EmailRedirectPage.tsx";
import VerifyEmailPage from "@/pages/auth/VerifyEmailpage.tsx";
import {
  ACCOUNT_VERIFICATION_PAGE,
  EMAIL_REDIRECT_PAGE,
  LOGIN_PAGE,
  REGISTER_PAGE,
} from "@/app.constants.ts";
import LoginPage from "./pages/auth/LoginPage";

const App = () => {
  const { data: session, isPending } = useSession();

  if (isPending) return <Spinner />;

  return (
    <Routes>
      <Route path={ACCOUNT_VERIFICATION_PAGE} element={<VerifyEmailPage />} />

      <Route element={!session ? <Outlet /> : <Navigate to="/" replace />}>
        <Route path={LOGIN_PAGE} element={<LoginPage />} />
        <Route path={REGISTER_PAGE} element={<RegisterPage />} />
        <Route path={EMAIL_REDIRECT_PAGE} element={<EmailRedirectPage />} />
      </Route>

      <Route element={session ? <Outlet /> : <Navigate to="/login" replace />}>
        <Route path="/" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
};

export default App;
