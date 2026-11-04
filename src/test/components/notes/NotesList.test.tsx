import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { INote } from "@/api/notes/index.ts";
import { NotesList } from "@/components/notes/NotesList.tsx";
import { render } from "@/test/render.tsx";

const UPDATED_LABEL = /Updated/;
const ROW_NAME = /^Alpha note/;

const note = (overrides: Partial<INote>): INote => ({
  id: "n-1",
  userId: "u-1",
  isFavorite: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  title: "Alpha note",
  ...overrides,
});

const renderList = (
  notes: INote[],
  props: Partial<Parameters<typeof NotesList>[0]> = {}
) =>
  render(
    <NotesList
      filtered={false}
      notes={notes}
      onClearFilters={vi.fn()}
      onEdit={vi.fn()}
      onFavoriteToggle={vi.fn().mockResolvedValue(undefined)}
      setSelectedId={vi.fn()}
      {...props}
    />
  );

describe("NotesList", () => {
  it("opens a note when the row is clicked", async () => {
    const setSelectedId = vi.fn();
    const { user } = renderList([note({})], { setSelectedId });

    const row = screen.getByRole("button", { name: ROW_NAME });
    expect(
      screen.getByRole("button", { name: "Edit Alpha note" })
    ).toBeInTheDocument();
    expect(screen.getByText(UPDATED_LABEL)).toBeInTheDocument();

    await user.click(row);
    expect(setSelectedId).toHaveBeenCalledWith("n-1");
  });

  it("offers a clear-filters action only when filtering", async () => {
    const onClearFilters = vi.fn();
    const { user } = renderList([], { filtered: true, onClearFilters });

    expect(
      screen.getByText("No notes match your filters.")
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });
});
