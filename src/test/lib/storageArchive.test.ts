import { describe, expect, it } from "vitest";
import { getArchivedValues, putArchivedValues } from "@/lib/storageArchive.ts";

describe("storageArchive", () => {
  it("round-trips archived values per user", async () => {
    const values = { "app-store": '{"state":{"userId":"u1"}}' };

    await putArchivedValues("user-round-trip", values);

    expect(await getArchivedValues("user-round-trip")).toEqual(values);
  });

  it("returns null for a user with nothing archived", async () => {
    expect(await getArchivedValues("user-missing")).toBeNull();
  });

  it("overwrites an existing archive", async () => {
    await putArchivedValues("user-overwrite", { a: "first" });
    await putArchivedValues("user-overwrite", { b: "second" });

    expect(await getArchivedValues("user-overwrite")).toEqual({ b: "second" });
  });

  it("keeps archives isolated between users", async () => {
    await putArchivedValues("user-a", { a: "1" });
    await putArchivedValues("user-b", { b: "2" });

    expect(await getArchivedValues("user-a")).toEqual({ a: "1" });
    expect(await getArchivedValues("user-b")).toEqual({ b: "2" });
  });
});
