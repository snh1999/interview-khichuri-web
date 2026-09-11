import { format } from "date-fns";
import type { IPrepSession } from "@/api/sessions";
import { useUpdateSession } from "@/api/sessions";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { useNavigateToSessionPage } from "@/components/prep-session/session/session.helpers.ts";
import { GutterCard } from "@/components/ui/custom/gutter-card.tsx";

interface IProps {
  session: IPrepSession;
  jobLabel?: string;
}

const getSessionVariant = (session: IPrepSession) => {
  if (session.isFavorite) {
    return "warning";
  }
  if (session.jobId) {
    return "success";
  }
  return "default";
};

export const SessionCardGrid = ({ session, jobLabel }: Readonly<IProps>) => {
  const navigateToPage = useNavigateToSessionPage(session.id);
  const updateSession = useUpdateSession();

  const variant = getSessionVariant(session);

  const handleToggleFavorite = () =>
    updateSession.mutateAsync({
      id: session.id,
      isFavorite: !session.isFavorite,
    });

  const createdDate = format(session.createdAt, "d MMMM yyyy");

  return (
    <GutterCard onClick={navigateToPage} variant={variant}>
      <div className="flex items-start justify-between gap-2">
        <p className="text font-semibold text-foreground leading-tight">
          {session.title || session.description}
        </p>
        <FavoriteButton
          icon="pin"
          isFavorite={session.isFavorite}
          onToggle={handleToggleFavorite}
        />
      </div>
      <p className="mt-1 text-muted-foreground text-sm">
        {jobLabel ?? (session.jobId ? "Linked to a job" : "Standalone session")}
      </p>
      <div className="mt-2.5 flex justify-between font-mono text-muted-foreground text-xs">
        <span>{session.experience ? `${session.experience}` : ""}</span>
        <span>{createdDate}</span>
      </div>
    </GutterCard>
  );
};
