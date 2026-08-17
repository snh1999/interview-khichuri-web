import { CaretRightIcon, HeartIcon } from "@phosphor-icons/react";
import type { IPrepSession } from "@/api/sessions";
import { useUpdateSession } from "@/api/sessions";
import { useNavigateToSessionPage } from "@/components/prep-session/session/session.helpers.ts";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
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
      className="py-2"
      render={
        <Button className="h-auto" onClick={navigateToPage} variant="ghost" />
      }
      size="sm"
    >
      <ItemContent className="min-w-0 flex-row items-center gap-3">
        <ItemTitle className="min-w-0 flex-1 truncate">
          {session.title}
          {jobLabel ? (
            <span className="text-muted-foreground"> — {jobLabel}</span>
          ) : null}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <MutationButton
          errorMessage="Failed to update favorite."
          mutationFn={handleToggleFavorite}
          size="icon-sm"
          variant="ghost"
        >
          <HeartIcon
            className={`size-3 ${session.isFavorite ? "text-destructive" : "text-muted-foreground"}`}
            weight={session.isFavorite ? "fill" : "regular"}
          />
        </MutationButton>
        <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </ItemActions>
    </Item>
  );
};
