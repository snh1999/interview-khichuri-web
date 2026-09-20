import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { type ChangeEvent, useState } from "react";
import type { INote } from "@/api/notes";
import { useNotes } from "@/api/notes";
import { NotesList } from "@/components/notes/NotesList.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export const NotesTab = ({
  onEdit,
  onFavoriteToggle,
  onSelect,
}: {
  onEdit: (note: INote) => void;
  onFavoriteToggle: (note: INote) => Promise<unknown>;
  onSelect: (id: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { data: notes } = useNotes();

  const query = search.trim().toLowerCase();
  const filteredNotes = notes.filter(
    (note) =>
      (!favoritesOnly || note.isFavorite) &&
      (!query ||
        note.title.toLowerCase().includes(query) ||
        (note.details ?? "").toLowerCase().includes(query))
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);
  const handleToggleFavoritesFilter = () => setFavoritesOnly((prev) => !prev);

  return (
    <div className="overflow-hidden rounded-md">
      <div className="flex items-center gap-2 px-2 pb-4">
        <InputGroup className="w-full">
          <InputGroupAddon align="inline-start">
            <MagnifyingGlassIcon className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            onChange={handleSearchChange}
            placeholder="Search notes..."
            value={search}
          />
        </InputGroup>
        <Button
          className="rounded-full"
          onClick={handleToggleFavoritesFilter}
          variant={favoritesOnly ? "default" : "outline"}
        >
          Favorites
        </Button>
      </div>
      <NotesList
        notes={filteredNotes}
        onEdit={onEdit}
        onFavoriteToggle={onFavoriteToggle}
        setSelectedId={onSelect}
      />
    </div>
  );
};
