import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { TAtsCategory, TStandaloneCategory } from "@/api/resumes";
import type { ILocalInterviewState } from "@/lib/interviewStorage";

// Pre-production storage bootstrap: instead of migrating schema versions, we
// bump the DB name whenever the schema changes and let the old DB get orphaned.
// TODO- cleanup before prod
const INDEX_DB_NAME = "interview-khichuri-storage-v2";
const DB_VERSION = 1;

export const SCORES_STORE = "scores";
export const REVIEWS_STORE = "reviews";
export const DRAFT_STORE = "interviewDrafts";
export const ARCHIVE_STORE = "interviewArchives";

export interface IAtsCacheEntry {
  jobId: string;
  resumeId: string;
  overall: number;
  categories: TAtsCategory[];
  recommendations: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  tailoringNotes: string;
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

interface IInterviewKhichuriDb extends DBSchema {
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
  interviewDrafts: {
    key: string;
    value: ILocalInterviewState;
    indexes: {
      "by-session": string;
      "by-startedAt": number;
    };
  };
  interviewArchives: {
    key: string;
    value: ILocalInterviewState;
    indexes: {
      "by-session": string;
      "by-startedAt": number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<IInterviewKhichuriDb>> | null = null;

export const getDb = (): Promise<IDBPDatabase<IInterviewKhichuriDb>> => {
  dbPromise ??= openDB<IInterviewKhichuriDb>(INDEX_DB_NAME, DB_VERSION, {
    upgrade(db) {
      const scores = db.createObjectStore(SCORES_STORE);
      scores.createIndex("by-job", "jobId");
      scores.createIndex("by-resume", "resumeId");
      scores.createIndex("by-timestamp", "timestamp");

      const reviews = db.createObjectStore(REVIEWS_STORE);
      reviews.createIndex("by-resume", "resumeId");
      reviews.createIndex("by-timestamp", "timestamp");

      const drafts = db.createObjectStore(DRAFT_STORE, {
        keyPath: "interviewId",
      });
      drafts.createIndex("by-session", "sessionId");
      drafts.createIndex("by-startedAt", "startedAt");

      const archives = db.createObjectStore(ARCHIVE_STORE, {
        keyPath: "interviewId",
      });
      archives.createIndex("by-session", "sessionId");
      archives.createIndex("by-startedAt", "startedAt");
    },
  });
  return dbPromise;
};

const entryKey = (jobId: string, resumeId: string) => `${jobId}|${resumeId}`;

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
  return entries.sort((a, b) => b.timestamp - a.timestamp);
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
  return (await db.get(REVIEWS_STORE, resumeId)) ?? null;
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

export const clearLocalCache = async (): Promise<void> => {
  await clearAtsScores();
  await clearStandaloneReviews();
  localStorage.clear();
};
