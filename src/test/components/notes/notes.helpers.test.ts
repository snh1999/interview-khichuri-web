import { describe, expect, it } from "vitest";
import type { INote } from "@/api/notes/index.ts";
import {
  filterNotes,
  noteDetailsPlain,
  sortNotes,
} from "@/components/notes/notes.helpers.ts";

const note = (overrides: Partial<INote>): INote => ({
  id: "n-1",
  userId: "u-1",
  isFavorite: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  title: "Untitled",
  ...overrides,
});

describe("filterNotes", () => {
  const notes = [
    note({ id: "a", title: "Algorithms", isFavorite: true }),
    note({ id: "b", title: "Systems", details: "Cache invalidation" }),
  ];

  it("matches title and details case-insensitively", () => {
    expect(filterNotes(notes, { favoritesOnly: false, query: "algo" })).toEqual(
      [notes[0]]
    );
    expect(
      filterNotes(notes, { favoritesOnly: false, query: "CACHE" })
    ).toEqual([notes[1]]);
  });

  it("combines the favorites filter with the query", () => {
    expect(filterNotes(notes, { favoritesOnly: true, query: "" })).toEqual([
      notes[0],
    ]);
    expect(
      filterNotes(notes, { favoritesOnly: true, query: "systems" })
    ).toEqual([]);
  });
});

describe("sortNotes", () => {
  const older = note({
    id: "old",
    title: "Zebra",
    createdAt: "2026-01-01",
    updatedAt: "2026-03-01",
  });
  const newer = note({
    id: "new",
    title: "Apple",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
  });
  const notes = [older, newer];

  it("sorts newest and oldest by creation date", () => {
    expect(sortNotes(notes, "newest").map((n) => n.id)).toEqual(["new", "old"]);
    expect(sortNotes(notes, "oldest").map((n) => n.id)).toEqual(["old", "new"]);
  });

  it("sorts recently updated by the updated date", () => {
    expect(sortNotes(notes, "updated").map((n) => n.id)).toEqual([
      "old",
      "new",
    ]);
  });

  it("keeps pinned notes first in every sort mode", () => {
    const pinned = note({
      id: "pinned",
      isFavorite: true,
      title: "Middle",
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
    });
    const withPinned = [...notes, pinned];

    expect(sortNotes(withPinned, "newest").map((n) => n.id)).toEqual([
      "pinned",
      "new",
      "old",
    ]);
    expect(sortNotes(withPinned, "title").map((n) => n.id)).toEqual([
      "pinned",
      "new",
      "old",
    ]);
  });

  it("sorts by title without mutating the input", () => {
    expect(sortNotes(notes, "title").map((n) => n.id)).toEqual(["new", "old"]);
    expect(notes.map((n) => n.id)).toEqual(["old", "new"]);
  });
});

describe("noteDetailsPlain", () => {
  it("strips common markdown and collapses whitespace", () => {
    expect(
      noteDetailsPlain("## Heading\n\n- **bold** and [link](https://x.dev)")
    ).toBe("Heading bold and link");
  });

  it("truncates long text and handles empty details", () => {
    expect(noteDetailsPlain("abcdef", 3)).toBe("abc…");
    expect(noteDetailsPlain(undefined)).toBe("");
    expect(noteDetailsPlain(null)).toBe("");
  });
});
