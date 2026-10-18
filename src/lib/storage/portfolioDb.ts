import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import type { Portfolio } from "@/components/portfolio/sketch/types";

/**
 * Per-user IndexedDB persistence for the portfolio stores. Rows carry a `userId`
 * tag (indexed) so two accounts on one browser no longer collide, replacing the
 * old localStorage archive/mute swap.
 *
 * `getItem` is driven by `useLocalDataOnLogin`, which stamps `activeUserId`
 * before rehydrating. With no active user there is nothing to load and nothing
 * to write, so reads degrade to `null` (store defaults) and writes are dropped.
 */

const DB_NAME = "khichuri-portfolio";
const DB_VERSION = 1;
const PREFS_STORE = "prefs";
const USER_INDEX = "by-user";

export type TCollectionStore = "portfolios" | "builderProjects";

interface PortfolioDbSchema extends DBSchema {
  portfolios: {
    key: string;
    value: Record<string, unknown>;
    indexes: { "by-user": string };
  };
  builderProjects: {
    key: string;
    value: Record<string, unknown>;
    indexes: { "by-user": string };
  };
  prefs: { key: string; value: Record<string, unknown> };
}

let dbPromise: Promise<IDBPDatabase<PortfolioDbSchema>> | null = null;

const getDb = (): Promise<IDBPDatabase<PortfolioDbSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<PortfolioDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("portfolios")) {
          const store = db.createObjectStore("portfolios", { keyPath: "id" });
          store.createIndex(USER_INDEX, "userId");
        }
        if (!db.objectStoreNames.contains("builderProjects")) {
          db.createObjectStore("builderProjects", {
            keyPath: "portfolioId",
          }).createIndex(USER_INDEX, "userId");
        }
        if (!db.objectStoreNames.contains(PREFS_STORE)) {
          db.createObjectStore(PREFS_STORE, { keyPath: "userId" });
        }
      },
    });
  }
  return dbPromise;
};

let activeUserId: string | undefined;

/** Stamped by `useLocalDataOnLogin` before the portfolio stores rehydrate. */
export const setActiveUserId = (userId: string | undefined): void => {
  activeUserId = userId;
};

export const getActiveUserId = (): string | undefined => activeUserId;

// One queue for all portfolio writes: zustand fires `setItem` per change and IDB
// writes are async, so without serialising an earlier state could land after a
// later one. Reading and deleting share it, so a delete can't be overtaken by an
// in-flight write that still contains the row.
let queue: Promise<void> = Promise.resolve();
const serialise = (task: () => Promise<void>): Promise<void> => {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
};

export interface IPersistCodec<TPersisted> {
  /** Per-portfolio collection rows; each row's key is the store's keyPath. */
  items: (state: TPersisted) => Record<string, unknown>[];
  /** Everything that is not a collection row (small per-user blob). */
  prefs: (state: TPersisted) => Record<string, unknown>;
  /** Rebuild the persisted state from rows + prefs. */
  merge: (
    items: Record<string, unknown>[],
    prefs: Record<string, unknown> | null
  ) => TPersisted;
  store: TCollectionStore;
  version: number;
}

const stripUserId = (row: Record<string, unknown>): Record<string, unknown> => {
  const { userId: _userId, ...rest } = row;
  return rest;
};

const readItems = async (
  store: TCollectionStore,
  userId: string
): Promise<Record<string, unknown>[]> => {
  const db = await getDb();
  const rows = await db.getAllFromIndex(store, USER_INDEX, userId);
  return rows.map(stripUserId);
};

const upsertItems = async (
  store: TCollectionStore,
  userId: string,
  items: Record<string, unknown>[]
): Promise<void> => {
  const db = await getDb();
  await Promise.all(items.map((item) => db.put(store, { ...item, userId })));
};

/**
 * Deletes one collection row for the active user. Row removal is explicit —
 * driven by the store action that drops the item (`deletePortfolio`,
 * `dropProject`) — never inferred from a snapshot's absence, which is what let
 * an unhydrated empty state wipe every row.
 */
export const deleteStoredRow = (
  store: TCollectionStore,
  key: string
): Promise<void> => {
  if (!activeUserId) {
    return Promise.resolve();
  }
  return serialise(async () => {
    const db = await getDb();
    await db.delete(store, key);
  });
};

/**
 * Reads every portfolio row for the active user. Drains the write queue first
 * so a read reflects every write already issued (the editor flushes per edit).
 * Rejects on a failed read: callers that delete unreferenced images must not
 * mistake a read failure for an empty portfolio list and wipe every image.
 */
export const getPortfolios = async (): Promise<Portfolio[]> => {
  const userId = activeUserId;
  if (!userId) {
    return [];
  }
  await queue.catch(() => undefined);
  return (await readItems("portfolios", userId)) as unknown as Portfolio[];
};

export const getPortfolio = async (id: string): Promise<Portfolio | null> => {
  const userId = activeUserId;
  if (!userId) {
    return null;
  }
  await queue.catch(() => undefined);
  try {
    const db = await getDb();
    const row = await db.get("portfolios", id);
    if (!row || (row as { userId?: string }).userId !== userId) {
      return null;
    }
    return stripUserId(row) as unknown as Portfolio;
  } catch (err) {
    console.warn("[portfolioDb] read failed:", err);
    return null;
  }
};

/**
 * Upserts one portfolio row. Generated designs are transient (never persisted),
 * matching the old `persist` partialize.
 */
export const putPortfolio = (portfolio: Portfolio): Promise<void> => {
  const userId = activeUserId;
  if (!userId) {
    return Promise.resolve();
  }
  return serialise(async () => {
    const db = await getDb();
    await db.put("portfolios", {
      ...portfolio,
      generatedDesigns: [],
      userId,
    });
  });
};

const readPrefs = async (
  userId: string
): Promise<Record<string, unknown> | null> => {
  const db = await getDb();
  const row = await db.get(PREFS_STORE, userId);
  return row ? stripUserId(row) : null;
};

const writePrefs = async (
  userId: string,
  prefs: Record<string, unknown>
): Promise<void> => {
  const db = await getDb();
  if (Object.keys(prefs).length === 0) {
    await db.delete(PREFS_STORE, userId);
    return;
  }
  await db.put(PREFS_STORE, { ...prefs, userId });
};

const clearUser = async (store: TCollectionStore, userId: string) => {
  const db = await getDb();
  const keys = await db.getAllKeysFromIndex(store, USER_INDEX, userId);
  await Promise.all(keys.map((key) => db.delete(store, key)));
};

/**
 * `PersistStorage` backed by `khichuri-portfolio` rows for the active user.
 * Writes are upserts only — the snapshot is never diffed against the store, so
 * an unhydrated (empty) state can only add rows, never delete them. Removing an
 * item is an explicit `deleteStoredRow` from the action that dropped it.
 */
export const createPortfolioStorage = <TPersisted>(
  codec: IPersistCodec<TPersisted>
): PersistStorage<TPersisted> => {
  return {
    getItem: async (): Promise<StorageValue<TPersisted> | null> => {
      const userId = activeUserId;
      if (!userId) {
        return null;
      }
      try {
        await queue.catch(() => undefined);
        const items = await readItems(codec.store, userId);
        const prefs = await readPrefs(userId);
        if (items.length === 0 && prefs === null) {
          return null;
        }
        return { state: codec.merge(items, prefs), version: codec.version };
      } catch (err) {
        console.warn("[portfolioDb] read failed:", err);
        return null;
      }
    },
    setItem: (_name, value): Promise<void> => {
      // Capture user + snapshot synchronously: the task runs later, after a swap
      // may have reassigned `activeUserId` or mutated state.
      const userId = activeUserId;
      if (!userId) {
        return Promise.resolve();
      }
      const items = codec.items(value.state);
      const prefs = codec.prefs(value.state);
      return serialise(async () => {
        try {
          await upsertItems(codec.store, userId, items);
          await writePrefs(userId, prefs);
        } catch (err) {
          console.warn("[portfolioDb] write failed:", err);
        }
      });
    },
    removeItem: (): Promise<void> => {
      const userId = activeUserId;
      if (!userId) {
        return Promise.resolve();
      }
      return serialise(async () => {
        try {
          await clearUser(codec.store, userId);
          await writePrefs(userId, {});
        } catch (err) {
          console.warn("[portfolioDb] delete failed:", err);
        }
      });
    },
  };
};
