import { ArrowSquareOutIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import { useSessions } from "@/api/sessions";
import { SESSIONS_PAGE } from "@/app.constants";
import { RECENT_ITEMS_COUNT } from "@/components/dashboard/dashboard.helpers.ts";
import { SessionListRow } from "@/components/prep-session/SessionListRow";
import { PrepSessionForm } from "@/components/prep-session/session/PrepSessionForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const RecentSessionsSection = () => {
  const { data } = useSessions();

  const sessions = data
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, RECENT_ITEMS_COUNT);
  const [open, setOpen] = useState(false);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-base">
          Recent sessions
        </CardTitle>
        <CardAction className="flex items-center gap-2">
          <Button aria-label="New session" onClick={openDialog} size="sm">
            <PlusCircleIcon />
          </Button>
          <Button
            nativeButton={false}
            render={<Link to={SESSIONS_PAGE} />}
            size="sm"
            variant="outline"
          >
            View
            <ArrowSquareOutIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No sessions yet — create your first one.
          </p>
        ) : (
          sessions.map((session) => (
            <SessionListRow
              hideFavorite
              key={session.id}
              session={session}
              showDate
            />
          ))
        )}
      </CardContent>

      <PrepSessionForm
        onOpenChange={setOpen}
        onSuccess={closeDialog}
        open={open}
      />
    </Card>
  );
};
