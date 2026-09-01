import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { TAtsCategory, TStandaloneCategory } from "@/api/resumes";

const INDEX_DB_NAME = "interview-khichuri";
const SCORES_STORE = "scores";
const REVIEWS_STORE = "reviews";

export interface IAtsCacheEntry {
  jobId: string;
  resumeId: string;
  overall: number;
  categories: TAtsCategory[];
  recommendations: string[];
  timestamp: number;
}

export interface IAtsScoreFilter {
  jobId?: string;
  resumeId?: string;
}

export interface IStandaloneReviewCacheEntry {
  resumeId: string;
  overall: number;
  categories: TStandaloneCategory[];
  timestamp: number;
}

interface IIndexDbSchema extends DBSchema {
  scores: {
    key: string;
    value: IAtsCacheEntry;
    indexes: {
      "by-job": string;
      "by-resume": string;
      "by-timestamp": number;
    };
  };
  reviews: {
    key: string;
    value: IStandaloneReviewCacheEntry;
    indexes: {
      "by-resume": string;
      "by-timestamp": number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<IIndexDbSchema>> | null = null;

const entryKey = (jobId: string, resumeId: string) => `${jobId}|${resumeId}`;

const normalizeAtsEntry = (entry: IAtsCacheEntry): IAtsCacheEntry => ({
  ...entry,
  categories: Array.isArray(entry.categories) ? entry.categories : [],
  recommendations: Array.isArray(entry.recommendations)
    ? entry.recommendations
    : [],
});

const normalizeReviewEntry = (
  entry: IStandaloneReviewCacheEntry
): IStandaloneReviewCacheEntry => ({
  ...entry,
  categories: Array.isArray(entry.categories) ? entry.categories : [],
});

const getDb = (): Promise<IDBPDatabase<IIndexDbSchema>> => {
  dbPromise ??= openDB<IIndexDbSchema>(INDEX_DB_NAME, 1, {
    upgrade(db) {
      const scores = db.createObjectStore(SCORES_STORE);
      scores.createIndex("by-job", "jobId");
      scores.createIndex("by-resume", "resumeId");
      scores.createIndex("by-timestamp", "timestamp");

      const reviews = db.createObjectStore(REVIEWS_STORE);
      reviews.createIndex("by-resume", "resumeId");
      reviews.createIndex("by-timestamp", "timestamp");
    },
  });
  return dbPromise;
};

export const getCachedAtsScore = async (
  jobId: string,
  resumeId: string
): Promise<IAtsCacheEntry | null> => {
  const db = await getDb();
  const entry = await db.get(SCORES_STORE, entryKey(jobId, resumeId));
  return entry ? normalizeAtsEntry(entry) : null;
};

export const getAtsScoreEntries = async (
  filter?: IAtsScoreFilter
): Promise<IAtsCacheEntry[]> => {
  const db = await getDb();
  const { jobId, resumeId } = filter ?? {};
  let entries: IAtsCacheEntry[];
  if (jobId) {
    entries = await db.getAllFromIndex(SCORES_STORE, "by-job", jobId);
    if (resumeId) {
      entries = entries.filter((entry) => entry.resumeId === resumeId);
    }
  } else if (resumeId) {
    entries = await db.getAllFromIndex(SCORES_STORE, "by-resume", resumeId);
  } else {
    entries = await db.getAll(SCORES_STORE);
  }
  return entries
    .map(normalizeAtsEntry)
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const setAtsScore = async (
  entry: Omit<IAtsCacheEntry, "timestamp">
): Promise<IAtsCacheEntry[]> => {
  const db = await getDb();
  await db.put(
    SCORES_STORE,
    { ...entry, timestamp: Date.now() },
    entryKey(entry.jobId, entry.resumeId)
  );
  return getAtsScoreEntries();
};

export const clearAtsScores = async (): Promise<void> => {
  const db = await getDb();
  await db.clear(SCORES_STORE);
};

export const getCachedStandaloneReview = async (
  resumeId: string
): Promise<IStandaloneReviewCacheEntry | null> => {
  const db = await getDb();
  const entry = await db.get(REVIEWS_STORE, resumeId);
  return entry ? normalizeReviewEntry(entry) : null;
};

export const setStandaloneReview = async (
  resumeId: string,
  overall: number,
  categories: TStandaloneCategory[]
): Promise<IStandaloneReviewCacheEntry> => {
  const db = await getDb();
  const entry: IStandaloneReviewCacheEntry = {
    resumeId,
    overall,
    categories,
    timestamp: Date.now(),
  };
  await db.put(REVIEWS_STORE, entry, resumeId);
  return entry;
};

export const clearStandaloneReviews = async (): Promise<void> => {
  const db = await getDb();
  await db.clear(REVIEWS_STORE);
};
