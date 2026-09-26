import { useTopics } from "@/api/lookups";
import type { IPrepSession } from "@/api/sessions";
import { useUpdateSession } from "@/api/sessions";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import {
  formatSessionDate,
  getMetaLabel,
  useNavigateToSessionPage,
} from "@/components/prep-session/session.helpers.ts";
import { GutterCard } from "@/components/ui/custom/GutterCard.tsx";
import { useLookupMap } from "@/hooks/useLookupMap.ts";

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
  const topicMap = useLookupMap(useTopics().data);

  const variant = getSessionVariant(session);

  const metaLabel = getMetaLabel(session, topicMap, jobLabel);

  const handleToggleFavorite = () =>
    updateSession.mutateAsync({
      id: session.id,
      isFavorite: !session.isFavorite,
    });

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
      <p className="mt-1 truncate text-muted-foreground text-sm">{metaLabel}</p>
      <div className="mt-2.5 flex justify-between font-mono text-muted-foreground text-xs">
        <span>{session.experience ? `${session.experience}` : ""}</span>
        <span>Created: {formatSessionDate(session.createdAt)}</span>
      </div>
    </GutterCard>
  );
};
