import { MagnifyingGlassIcon, SortAscendingIcon } from "@phosphor-icons/react";
import { type ChangeEvent, useState } from "react";
import type { INote } from "@/api/notes";
import { useNotes } from "@/api/notes";
import { NotesList } from "@/components/notes/NotesList.tsx";
import {
  filterNotes,
  NOTE_SORT_OPTIONS,
  sortNotes,
  type TNoteSortKey,
} from "@/components/notes/notes.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [sort, setSort] = useState<TNoteSortKey>("newest");

  const { data: notes } = useNotes();

  const filteredNotes = filterNotes(notes, { favoritesOnly, query: search });
  const visibleNotes = sortNotes(filteredNotes, sort);
  const isFiltered = Boolean(search.trim()) || favoritesOnly;

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);
  const handleToggleFavoritesFilter = () => setFavoritesOnly((prev) => !prev);
  const handleSortChange = (value: string) => setSort(value as TNoteSortKey);
  const handleClearFilters = () => {
    setSearch("");
    setFavoritesOnly(false);
  };

  return (
    <div className="h-full overflow-hidden rounded-md">
      <div className="flex flex-wrap items-center gap-2 px-2 pb-4">
        <InputGroup className="min-w-40 flex-1">
          <InputGroupAddon align="inline-start">
            <MagnifyingGlassIcon className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search notes"
            onChange={handleSearchChange}
            placeholder="Search notes..."
            value={search}
          />
        </InputGroup>
        <Button
          aria-pressed={favoritesOnly}
          className="rounded-full"
          onClick={handleToggleFavoritesFilter}
          variant={favoritesOnly ? "default" : "outline"}
        >
          Favorites
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="gap-1.5" variant="outline">
                <SortAscendingIcon className="size-3.5" />
                <span className="max-w-28 truncate">
                  {NOTE_SORT_OPTIONS.find((option) => option.value === sort)
                    ?.label ?? "Sort"}
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              onValueChange={handleSortChange}
              value={sort}
            >
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              {NOTE_SORT_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <NotesList
        filtered={isFiltered}
        notes={visibleNotes}
        onClearFilters={handleClearFilters}
        onEdit={onEdit}
        onFavoriteToggle={onFavoriteToggle}
        setSelectedId={onSelect}
      />
    </div>
  );
};
