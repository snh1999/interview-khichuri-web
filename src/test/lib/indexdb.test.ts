import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ARCHIVE_STORE,
  clearAtsScores,
  clearStandaloneReviews,
  DRAFT_STORE,
  deleteAtsScoresByResumeId,
  deleteStandaloneReview,
  getAtsScoreEntries,
  getCachedStandaloneReview,
  getDb,
  type IAtsCacheEntry,
  REVIEWS_STORE,
  retryLocalEntryCleanup,
  SCORES_STORE,
  setAtsScore,
  setStandaloneReview,
} from "@/lib/indexdb.ts";

const score = (
  jobId: string,
  resumeId: string,
  timestamp: number
): IAtsCacheEntry => ({
  jobId,
  resumeId,
  overall: 80,
  categories: [],
  recommendations: [],
  matchedKeywords: [],
  missingKeywords: [],
  tailoringNotes: "",
  timestamp,
});

describe("indexdb ats score cache", () => {
  beforeEach(async () => {
    const db = await getDb();
    await db.clear(SCORES_STORE);
    await db.clear(REVIEWS_STORE);
    await db.clear(DRAFT_STORE);
    await db.clear(ARCHIVE_STORE);
  });

  it("stores an entry and returns every entry newest first", async () => {
    const db = await getDb();
    await db.put(
      SCORES_STORE,
      score("job-old", "resume-1", 100),
      "job-old|resume-1"
    );
    await db.put(
      SCORES_STORE,
      score("job-mid", "resume-1", 300),
      "job-mid|resume-1"
    );
    await db.put(
      SCORES_STORE,
      score("job-new", "resume-1", 200),
      "job-new|resume-1"
    );

    const entries = await getAtsScoreEntries();

    expect(entries.map((entry) => entry.timestamp)).toEqual([300, 200, 100]);
  });

  it("replaces the entry for the same job and resume pair", async () => {
    await setAtsScore(score("job-1", "resume-1", 0));
    await setAtsScore({ ...score("job-1", "resume-1", 0), overall: 95 });

    const entries = await getAtsScoreEntries();

    expect(entries).toHaveLength(1);
    expect(entries[0]?.overall).toBe(95);
  });

  it("filters by job, by resume, and by both", async () => {
    const db = await getDb();
    await db.put(SCORES_STORE, score("job-a", "resume-1", 1), "job-a|resume-1");
    await db.put(SCORES_STORE, score("job-a", "resume-2", 2), "job-a|resume-2");
    await db.put(SCORES_STORE, score("job-b", "resume-1", 3), "job-b|resume-1");

    expect(await getAtsScoreEntries({ jobId: "job-a" })).toHaveLength(2);
    expect(await getAtsScoreEntries({ resumeId: "resume-1" })).toHaveLength(2);
    expect(
      await getAtsScoreEntries({ jobId: "job-a", resumeId: "resume-2" })
    ).toHaveLength(1);
    expect(
      (await getAtsScoreEntries({ jobId: "job-b", resumeId: "resume-2" }))
        .length
    ).toBe(0);
  });

  it("clears every cached score", async () => {
    await setAtsScore(score("job-1", "resume-1", 0));

    await clearAtsScores();

    expect(await getAtsScoreEntries()).toEqual([]);
  });

  it("deletes only the scores belonging to one resume", async () => {
    const db = await getDb();
    await db.put(SCORES_STORE, score("job-a", "resume-1", 1), "job-a|resume-1");
    await db.put(SCORES_STORE, score("job-b", "resume-1", 2), "job-b|resume-1");
    await db.put(SCORES_STORE, score("job-c", "resume-2", 3), "job-c|resume-2");

    await deleteAtsScoresByResumeId("resume-1");

    const entries = await getAtsScoreEntries();
    expect(entries.map((entry) => entry.resumeId)).toEqual(["resume-2"]);
  });
});

describe("indexdb standalone reviews", () => {
  beforeEach(async () => {
    const db = await getDb();
    await db.clear(REVIEWS_STORE);
  });

  it("stores and reads back a review", async () => {
    const entry = await setStandaloneReview("resume-1", 88, []);

    expect(await getCachedStandaloneReview("resume-1")).toEqual(entry);
  });

  it("returns null when nothing is cached for the resume", async () => {
    expect(await getCachedStandaloneReview("resume-none")).toBeNull();
  });

  it("deletes and clears cached reviews", async () => {
    await setStandaloneReview("resume-1", 70, []);
    await setStandaloneReview("resume-2", 90, []);

    await deleteStandaloneReview("resume-1");
    expect(await getCachedStandaloneReview("resume-1")).toBeNull();
    expect(await getCachedStandaloneReview("resume-2")).not.toBeNull();

    await clearStandaloneReviews();
    expect(await getCachedStandaloneReview("resume-2")).toBeNull();
  });
});

describe("retryLocalEntryCleanup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not retry when every cleanup succeeds", async () => {
    const cleanup = vi.fn().mockResolvedValue(undefined);

    await retryLocalEntryCleanup("entry-1", [cleanup]);

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("retries failed cleanups after a short delay", async () => {
    const failing = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(undefined);
    const succeeding = vi.fn().mockResolvedValue(undefined);

    const pending = retryLocalEntryCleanup("entry-1", [failing, succeeding]);
    await vi.advanceTimersByTimeAsync(300);
    await pending;

    expect(failing).toHaveBeenCalledTimes(2);
    expect(succeeding).toHaveBeenCalledTimes(2);
  });
});
