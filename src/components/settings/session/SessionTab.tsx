import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useNavigate } from "react-router";
import { useListSessions, useRevokeOtherSessions } from "@/api/auth";
import { LOGIN_PAGE } from "@/app.constants.ts";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { SessionCard } from "@/components/settings/session/SessionCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useSession } from "@/lib/auth/auth-client.ts";

export const SessionTab = () => (
  <AppErrorSuspense fallback={SessionSkeleton}>
    <ErrorBoundary FallbackComponent={SessionNotFreshFallback}>
      <SessionManagement />
    </ErrorBoundary>
  </AppErrorSuspense>
);
const SessionManagement = () => {
  const { data } = useSession();
  const { data: sessions } = useListSessions();
  const { mutateAsync: revokeOtherSessions } = useRevokeOtherSessions();

  if (!(data && sessions)) {
    return null;
  }

  const currentSession = data.session;
  const otherSessions = sessions.filter(
    (session) => session.token !== currentSession.token
  );

  return (
    <Card className="space-y-6">
      <CardContent className="mb-2">
        {currentSession ? (
          <SessionCard isCurrentSession session={currentSession} />
        ) : null}
      </CardContent>

      {otherSessions.length > 0 && (
        <CardHeader className="my-0">
          <CardTitle>Other Active Sessions</CardTitle>
          <CardAction>
            <AuthActionButton
              action={revokeOtherSessions}
              successMessage="Revoked other sessions"
              variant="destructive"
            >
              Revoke Other Sessions
            </AuthActionButton>
          </CardAction>
        </CardHeader>
      )}

      <CardContent>
        {otherSessions.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs italic opacity-70">
            No other active sessions
          </div>
        ) : (
          <div className="space-y-3">
            {otherSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SessionNotFreshFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    resetErrorBoundary();
    navigate(LOGIN_PAGE);
  };

  // @ts-expect-error
  if ("message" in error && error?.message !== "Session is not fresh") {
    throw error;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Session Has Session Expired</CardTitle>
        <CardDescription>Log in again to manage sessions</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={handleLogin}>Log In</Button>
      </CardFooter>
    </Card>
  );
};

const SessionSkeleton = () => (
  <Card>
    <CardContent>
      <Skeleton className="h-25 w-full" />
      <Spinner className="h-20" />
    </CardContent>
  </Card>
);
