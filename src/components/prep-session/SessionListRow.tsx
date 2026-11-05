import { BriefcaseIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { IPrepSession } from "@/api/sessions";
import { useUpdateSession } from "@/api/sessions";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import {
  formatSessionDate,
  getMetaLabel,
  useNavigateToSessionPage,
} from "@/components/prep-session/session.helpers.ts";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { useTopicsMap } from "@/hooks/useLookupMap.ts";

interface IProps {
  session: IPrepSession;
  subtitle?: string;
  showDate?: boolean;
  hideFavorite?: boolean;
}
export const SessionListRow = ({
  session,
  subtitle,
  showDate = false,
  hideFavorite = false,
}: Readonly<IProps>) => {
  const navigateToPage = useNavigateToSessionPage(session.id);
  const updateSession = useUpdateSession();
  const topicMap = useTopicsMap();

  const metaLabel = getMetaLabel(session, topicMap, subtitle);

  const handleToggleFavorite = () =>
    updateSession.mutateAsync({
      id: session.id,
      isFavorite: !session.isFavorite,
    });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigateToPage();
    }
  };

  return (
    <Item
      className="bg-muted/60 rounded-sm"
      onClick={navigateToPage}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <ItemContent className="min-w-0 gap-0.5 space-y-1.5">
        <ItemTitle className="min-w-0 flex-1 truncate text-sm">
          {session.title}
        </ItemTitle>
        <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs">
          <BriefcaseIcon />
          <span className="truncate">{metaLabel}</span>
        </span>
      </ItemContent>
      <ItemActions>
        {hideFavorite ? null : (
          <FavoriteButton
            icon="pin"
            isFavorite={session.isFavorite}
            onToggle={handleToggleFavorite}
          />
        )}
        {showDate ? (
          <span className="text-muted-foreground shrink-0 text-xs font-normal">
            {formatSessionDate(session.createdAt)}
          </span>
        ) : null}
        <CaretRightIcon className="text-muted-foreground size-4 shrink-0" />
      </ItemActions>
    </Item>
  );
};
