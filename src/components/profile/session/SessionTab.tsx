import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { SessionCard } from "@/components/profile/session/SessionCard.tsx";
import { useListSessions, useRevokeOtherSessions } from "@/api/auth";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useSession } from "@/lib/auth/auth-client.ts";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

export const SessionTab = () => {
  return (
    <AppErrorSuspense Fallback={SessionSkeleton}>
      <SessionManagement />
    </AppErrorSuspense>
  );
};
const SessionManagement = () => {
  const { data } = useSession();
  const { data: sessions } = useListSessions();
  const { mutateAsync: revokeOtherSessions } = useRevokeOtherSessions();

  if (!data || !sessions) {
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
          <SessionCard session={currentSession} isCurrentSession />
        ) : null}

        <div className="mt-6 space-y-4">
          {otherSessions.length > 0 && (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Other Active Sessions</h3>
              <AuthActionButton
                variant="destructive"
                size="sm"
                action={revokeOtherSessions}
                successMessage="Revoked other sessions"
              >
                Revoke Other Sessions
              </AuthActionButton>
            </div>
          )}

          {otherSessions.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
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
