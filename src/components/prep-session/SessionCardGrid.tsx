import { BriefcaseIcon } from "@phosphor-icons/react";
import type { IPrepSession } from "@/api/sessions";
import { useUpdateSession } from "@/api/sessions";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { useNavigateToSessionPage } from "@/components/prep-session/session/session.helpers.ts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface IProps {
  session: IPrepSession;
  jobLabel?: string;
}

export const SessionCardGrid = ({ session, jobLabel }: Readonly<IProps>) => {
  const navigateToPage = useNavigateToSessionPage(session.id);
  const updateSession = useUpdateSession();

  const handleToggleFavorite = () =>
    updateSession.mutateAsync({
      id: session.id,
      isFavorite: !session.isFavorite,
    });

  return (
    <Card
      className="cursor-pointer gap-2 px-4 py-4"
      onClick={navigateToPage}
      size="sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 truncate text-muted-foreground text-sm">
          <BriefcaseIcon className="size-3.5 shrink-0" />
          {jobLabel ?? "No job linked"}
        </span>
        <div className="flex items-center gap-1">
          {session.experience ? (
            <Badge className="shrink-0 bg-secondary text-secondary-foreground">
              {session.experience}
            </Badge>
          ) : null}
          <FavoriteButton
            isFavorite={session.isFavorite}
            onToggle={handleToggleFavorite}
          />
        </div>
      </div>

      <p className="truncate font-medium text-xs">
        {session.title || session.description}
      </p>
    </Card>
  );
};
