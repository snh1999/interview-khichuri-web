import { useState } from "react";
import type { IJob } from "@/api/jobs";
import { useSessions } from "@/api/sessions";
import { SessionListRow } from "@/components/prep-session/SessionListRow.tsx";
import { PrepSessionForm } from "@/components/prep-session/session/PrepSessionForm.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const LinkedSessionsSection = ({ job }: { job: IJob }) => {
  const { data: sessions } = useSessions();
  const [open, setOpen] = useState(false);
  const linkedSessions = sessions.filter((session) => session.jobId === job.id);
  const closeDialog = () => setOpen(false);

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
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-muted-foreground text-sm">
              No sessions linked yet.
            </p>
            <PrepSessionForm
              onOpenChange={setOpen}
              onSuccess={closeDialog}
              open={open}
              viewTrigger
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
