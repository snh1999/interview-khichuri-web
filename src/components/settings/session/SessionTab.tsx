import { useListSessions, useRevokeOtherSessions } from "@/api/auth";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { SessionCard } from "@/components/settings/session/SessionCard.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useSession } from "@/lib/auth/auth-client.ts";

export const SessionTab = () => (
  <AppErrorSuspense fallback={SessionSkeleton}>
    <SessionManagement />
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
      <CardContent>
        {currentSession ? (
          <SessionCard isCurrentSession session={currentSession} />
        ) : null}

        <div className="mt-6 space-y-4">
          {otherSessions.length > 0 && (
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Other Active Sessions</h3>
              <AuthActionButton
                action={revokeOtherSessions}
                size="sm"
                successMessage="Revoked other sessions"
                variant="destructive"
              >
                Revoke Other Sessions
              </AuthActionButton>
            </div>
          )}

          {otherSessions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No other active sessions
            </div>
          ) : (
            <div className="space-y-3">
              {otherSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
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
