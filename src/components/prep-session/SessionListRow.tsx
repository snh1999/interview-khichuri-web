import { BriefcaseIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useTopics } from "@/api/lookups";
import type { IPrepSession } from "@/api/sessions";
import { useUpdateSession } from "@/api/sessions";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import {
  formatSessionDate,
  getMetaLabel,
  useNavigateToSessionPage,
} from "@/components/prep-session/session.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { useLookupMap } from "@/hooks/useLookupMap.ts";

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
  const topicMap = useLookupMap(useTopics().data);

  const metaLabel = getMetaLabel(session, topicMap, subtitle);

  const handleToggleFavorite = () =>
    updateSession.mutateAsync({
      id: session.id,
      isFavorite: !session.isFavorite,
    });

  return (
    <Item
      className="rounded-sm bg-muted/60"
      render={
        <Button className="h-auto" onClick={navigateToPage} variant="ghost" />
      }
    >
      <ItemContent className="min-w-0 gap-0.5 space-y-1.5">
        <ItemTitle className="min-w-0 flex-1 truncate text-sm">
          {session.title}
        </ItemTitle>
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
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
          <span className="shrink-0 font-normal text-muted-foreground text-xs">
            {formatSessionDate(session.createdAt)}
          </span>
        ) : null}
        <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </ItemActions>
    </Item>
  );
};
