import type { IJob } from "@/api/jobs";
import { useSessions } from "@/api/sessions";
import { SessionListRow } from "@/components/prep-session/SessionListRow.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const LinkedSessionsSection = ({ job }: { job: IJob }) => {
  const { data: sessions } = useSessions();
  const linkedSessions = sessions.filter((session) => session.jobId === job.id);

  return (
    <Card className="px-1">
      <CardHeader className="border-b">
        <CardTitle>Linked Sessions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 pt-4">
        {linkedSessions.map((session) => (
          <SessionListRow key={session.id} session={session} />
        ))}
        {linkedSessions.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">
            No sessions linked yet.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};
