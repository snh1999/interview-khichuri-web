import {
  BriefcaseIcon,
  CalendarCheckIcon,
  PencilIcon,
} from "@phosphor-icons/react";
import type { INote } from "@/api/notes";
import { noteLinkKind } from "@/api/notes";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { formatDate } from "@/components/notes/notes.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { useStrictSafeAutoAnimate } from "@/hooks/useStrictSafeAutoAnimate";

interface IProps {
  setSelectedId: (id: string) => void;
  onFavoriteToggle: (note: INote) => Promise<unknown>;
  onEdit: (note: INote) => void;
}

export const NotesList = ({
  notes,
  ...props
}: Readonly<IProps & { notes: INote[] }>) => {
  const [listParent] = useStrictSafeAutoAnimate();

  return (
    <div className="overflow-hidden rounded-md">
      {notes.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No notes found.</EmptyTitle>
            <EmptyDescription>
              Create a note to keep questions and study material handy.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup
          className="overflow-hidden rounded-md bg-card"
          ref={listParent}
        >
          {notes.map((note) => (
            <NoteListItem key={note.id} note={note} {...props} />
          ))}
        </ItemGroup>
      )}
    </div>
  );
};

const NoteListItem = ({
  note,
  setSelectedId,
  onFavoriteToggle,
  onEdit,
}: Readonly<IProps & { note: INote }>) => {
  const kind = noteLinkKind(note);
  const handleSelect = () => setSelectedId(note.id);
  const handleToggleFavorite = () => onFavoriteToggle(note);
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(note);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <Item
      className="rounded-sm bg-muted/60"
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <ItemContent className="min-w-0 gap-0.5 space-y-1.5">
        <ItemTitle className="min-w-0 flex-1 truncate text-sm">
          {note.title}
        </ItemTitle>

        <span className="flex min-w-0 flex-wrap items-center gap-2 text-muted-foreground text-xs">
          {kind === "job" ? (
            <span className="flex min-w-0 flex-row items-center gap-1.5">
              <BriefcaseIcon className="size-3.5 shrink-0" />
              <span className="truncate">{note.jobTitle ?? "Job"}</span>
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <CalendarCheckIcon className="size-3.5 shrink-0" />
            {formatDate(note.updatedAt)}
          </span>
        </span>
      </ItemContent>
      <ItemActions>
        <FavoriteButton
          icon="pin"
          isFavorite={note.isFavorite}
          onToggle={handleToggleFavorite}
        />
        <Button onClick={handleEdit}>
          <PencilIcon />
        </Button>
      </ItemActions>
    </Item>
  );
};
