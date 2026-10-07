import { describe, expect, it, vi } from "vitest";
import { apiClient, queryKeys } from "@/api/index.ts";

describe("queryKeys", () => {
  it("builds admin keys including the permissions getter", () => {
    expect(queryKeys.admin.all).toEqual(["admin"]);
    expect(queryKeys.admin.permissions).toEqual(["admin", "permissions"]);
    expect(queryKeys.admin.permission({})).toContainEqual({});
    expect(queryKeys.admin.sessions({ a: 1 })).toEqual([
      "admin",
      "sessions",
      { a: 1 },
    ]);
    expect(queryKeys.admin.users()).toEqual(["admin", "users", undefined]);
  });

  it("builds auth and calendar keys", () => {
    expect(queryKeys.auth.accounts).toEqual(["account"]);
    expect(queryKeys.auth.passkey).toEqual(["passkey"]);
    expect(queryKeys.auth.session).toEqual(["session"]);
    expect(queryKeys.calendar.events).toEqual(["calendar", "events"]);
  });

  it("builds job, key and lookup keys", () => {
    expect(queryKeys.jobs.detail("j-1")).toEqual(["jobs", "detail", "j-1"]);
    expect(queryKeys.jobs.list({ a: 1 })).toEqual(["jobs", "list", { a: 1 }]);
    expect(queryKeys.keys.list()).toEqual(["keys", "list", undefined]);
    expect(queryKeys.lookups.topics).toEqual(["lookups", "topics"]);
  });

  it("builds interview and note keys", () => {
    expect(queryKeys.interviews.list()).toEqual(["interviews", "list", {}]);
    expect(queryKeys.interviews.draft("i-1")).toEqual([
      "interviews",
      "draft",
      "i-1",
    ]);
    expect(queryKeys.notes.detailsAndList("n-1")).toEqual([
      queryKeys.notes.list(),
      queryKeys.notes.detail("n-1"),
    ]);
  });

  it("builds resume keys including the ats getter", () => {
    expect(queryKeys.resumes.ats.all).toEqual(["reviews", "ats"]);
    expect(queryKeys.resumes.ats.filter()).toEqual(["reviews", "ats", {}]);
    expect(queryKeys.resumes.reviewById("r-1")).toEqual([
      ...queryKeys.resumes.resumeById("r-1"),
      "reviews",
    ]);
  });

  it("builds prompt and session keys including the defaults getter", () => {
    expect(queryKeys.prompts.defaults).toEqual(["prompts", "defaults"]);
    expect(queryKeys.prompts.list("my", { type: "resume" })).toEqual([
      "prompts",
      "my",
      { type: "resume" },
    ]);
    expect(queryKeys.sessions.questions("s-1")).toEqual([
      "sessions",
      "questions",
      "s-1",
    ]);
  });
});

describe("apiClient mutation cache", () => {
  it("invalidates a resolved array of keys", async () => {
    const invalidate = vi.spyOn(apiClient, "invalidateQueries");
    await apiClient
      .getMutationCache()
      .config.onSuccess?.(undefined, undefined, undefined, {
        meta: { invalidates: ["a", "b"] },
      } as never);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["a", "b"] });
    invalidate.mockRestore();
  });

  it("invalidates nested key arrays and removes queries", async () => {
    const invalidate = vi.spyOn(apiClient, "invalidateQueries");
    const remove = vi.spyOn(apiClient, "removeQueries");
    await apiClient
      .getMutationCache()
      .config.onSuccess?.(undefined, undefined, undefined, {
        meta: {
          invalidates: () => [["a"], ["b"]],
          removes: () => [["c"], ["d"]],
        },
      } as never);
    expect(invalidate).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(2);
    invalidate.mockRestore();
    remove.mockRestore();
  });

  it("ignores empty meta", async () => {
    const invalidate = vi.spyOn(apiClient, "invalidateQueries");
    await apiClient
      .getMutationCache()
      .config.onSuccess?.(undefined, undefined, undefined, {
        meta: { invalidates: [] },
      } as never);
    expect(invalidate).not.toHaveBeenCalled();
    invalidate.mockRestore();
  });
});
