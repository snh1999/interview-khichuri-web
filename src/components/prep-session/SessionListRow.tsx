import { CaretRightIcon } from "@phosphor-icons/react";
import type { IPrepSession } from "@/api/sessions";
import { useUpdateSession } from "@/api/sessions";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { useNavigateToSessionPage } from "@/components/prep-session/session/session.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item.tsx";

export const SessionListRow = ({
  session,
  jobLabel,
}: {
  session: IPrepSession;
  jobLabel?: string;
}) => {
  const navigateToPage = useNavigateToSessionPage(session.id);
  const updateSession = useUpdateSession();

  const handleToggleFavorite = () =>
    updateSession.mutateAsync({
      id: session.id,
      isFavorite: !session.isFavorite,
    });

  return (
    <Item
      className="rounded-sm border-border px-4 py-2"
      render={
        <Button className="h-auto" onClick={navigateToPage} variant="ghost" />
      }
      size="xs"
    >
      <ItemContent className="min-w-0 flex-row items-center gap-3">
        <ItemTitle className="min-w-0 flex-1 truncate text-base">
          {session.title}
          {jobLabel ? (
            <span className="text-muted-foreground"> — {jobLabel}</span>
          ) : null}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <FavoriteButton
          icon="pin"
          isFavorite={session.isFavorite}
          onToggle={handleToggleFavorite}
        />
        <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </ItemActions>
    </Item>
  );
};
