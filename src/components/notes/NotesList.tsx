import { ClockIcon, PencilIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import type { INote } from "@/api/notes";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { noteDetailsPlain } from "@/components/notes/notes.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyContent,
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
  filtered,
  notes,
  onClearFilters,
  ...props
}: Readonly<
  IProps & { notes: INote[]; filtered: boolean; onClearFilters: () => void }
>) => {
  const [listParent] = useStrictSafeAutoAnimate();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md">
      {notes.length === 0 ? (
        <Empty fullHeight>
          <EmptyHeader>
            <EmptyTitle>
              {filtered ? "No notes match your filters." : "No notes yet."}
            </EmptyTitle>
            <EmptyDescription>
              {filtered
                ? "Try a different search, or turn off the Favorites filter."
                : "Create a note to keep questions and study material handy."}
            </EmptyDescription>
          </EmptyHeader>
          {filtered ? (
            <EmptyContent>
              <Button onClick={onClearFilters} size="sm" variant="outline">
                Clear filters
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <ItemGroup
          className="gap-0 divide-y divide-border overflow-hidden rounded-md bg-card"
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
  const noteDetails = noteDetailsPlain(note.details);
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
      className="rounded-none hover:bg-muted/50"
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <ItemContent className="min-w-0 gap-0.5 space-y-1.5">
        <ItemTitle className="min-w-0 flex-1 truncate text-sm">
          {note.title}
        </ItemTitle>

        {noteDetails ? (
          <p className="line-clamp-1 text-muted-foreground text-xs">
            {noteDetails}
          </p>
        ) : null}

        <span className="flex min-w-0 flex-wrap items-center gap-2 text-muted-foreground text-xs">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="size-3.5 shrink-0" />
            Updated {format(note.updatedAt, "dd MMM, yyyy")}
          </span>
        </span>
      </ItemContent>
      <ItemActions>
        <FavoriteButton
          icon="pin"
          isFavorite={note.isFavorite}
          onToggle={handleToggleFavorite}
        />
        <Button aria-label={`Edit ${note.title}`} onClick={handleEdit}>
          <PencilIcon />
        </Button>
      </ItemActions>
    </Item>
  );
};
