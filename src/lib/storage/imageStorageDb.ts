import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { getActiveUserId } from "./portfolioDb";

interface AssetsDbSchema extends DBSchema {
  assets: {
    key: string;
    value: {
      id: string;
      userId: string;
      dataUrl: string;
      savedAt: number;
    };
    indexes: { "by-user": string };
  };
}

const DB_NAME = "interview-khichuri-assets-db";
const DB_VERSION = 1;
const STORE_NAME = "assets";
const USER_INDEX = "by-user";

let dbPromise: Promise<IDBPDatabase<AssetsDbSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<AssetsDbSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<AssetsDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex(USER_INDEX, "userId");
        }
      },
    });
  }
  return dbPromise;
}

export async function saveAssetImage(
  id: string,
  dataUrl: string
): Promise<boolean> {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, {
      id,
      userId: getActiveUserId() ?? "",
      dataUrl,
      savedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.warn("Failed to save asset to IndexedDB:", err);
    return false;
  }
}

export async function cloneAssetImage(
  oldId: string,
  newId: string
): Promise<boolean> {
  try {
    const dataUrl = await getAssetImage(oldId);
    if (!dataUrl) {
      return false;
    }
    return await saveAssetImage(newId, dataUrl);
  } catch {
    return false;
  }
}

export async function getAssetImage(id: string): Promise<string | null> {
  try {
    const db = await getDb();
    const record = await db.get(STORE_NAME, id);
    return record?.dataUrl ?? null;
  } catch {
    return null;
  }
}

export async function deleteAssetImage(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
  } catch {
    // Best-effort: a failed delete must not break the caller.
  }
}

export async function cleanupOrphanAssetImages(
  validAssetIds: Set<string>
): Promise<void> {
  const userId = getActiveUserId();
  if (!userId) {
    return;
  }
  try {
    const db = await getDb();
    const rows = await db.getAllFromIndex(STORE_NAME, USER_INDEX, userId);
    for (const row of rows) {
      if (!validAssetIds.has(row.id)) {
        // biome-ignore lint/performance/noAwaitInLoops: sequential deletes keep IDB transactions strictly ordered
        await db.delete(STORE_NAME, row.id);
      }
    }
  } catch {
    // Best-effort: a failed cleanup must not break the caller.
  }
}

export const saveMoodboardImage = saveAssetImage;
export const getMoodboardImage = getAssetImage;
export const deleteMoodboardImage = deleteAssetImage;
