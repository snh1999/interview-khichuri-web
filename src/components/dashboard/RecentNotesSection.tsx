import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { useNotes } from "@/api/notes";
import { NOTES_PAGE } from "@/app.constants";
import {
  NOTES_FETCH_LIMIT,
  RECENT_NOTES_COUNT,
} from "@/components/dashboard/dashboard.helpers.ts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const RecentNotesSection = () => {
  const { data } = useNotes({ limit: NOTES_FETCH_LIMIT });

  const notes = data
    .filter((note) => !note.isFavorite)
    .slice(0, RECENT_NOTES_COUNT);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-md">Recent notes</CardTitle>
        <CardAction>
          <Button render={<Link to={NOTES_PAGE} />} size="sm" variant="outline">
            View
            <ArrowSquareOutIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notes yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <Link
                className="min-w-0 truncate text-md hover:text-primary"
                key={note.id}
                title={note.title}
                to={NOTES_PAGE}
              >
                {note.title}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
