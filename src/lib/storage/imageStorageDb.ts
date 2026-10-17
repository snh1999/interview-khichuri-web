import { type DBSchema, type IDBPDatabase, openDB } from "idb";

interface AssetsDbSchema extends DBSchema {
  assets: {
    key: string;
    value: {
      id: string;
      dataUrl: string;
      savedAt: number;
    };
  };
}

const DB_NAME = "interview-khichuri-assets-db";
const DB_VERSION = 2;
const STORE_NAME = "assets";

let dbPromise: Promise<IDBPDatabase<AssetsDbSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<AssetsDbSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<AssetsDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1 && !db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
        if (oldVersion === 1 && !db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
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
    await db.put(STORE_NAME, { id, dataUrl, savedAt: Date.now() });
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
  try {
    const db = await getDb();
    const allKeys = await db.getAllKeys(STORE_NAME);
    for (const key of allKeys) {
      if (typeof key === "string" && !validAssetIds.has(key)) {
        // biome-ignore lint/performance/noAwaitInLoops: sequential deletes keep IDB transactions strictly ordered
        await db.delete(STORE_NAME, key);
      }
    }
  } catch {
    // Best-effort: a failed cleanup must not break the caller.
  }
}

export const saveMoodboardImage = saveAssetImage;
export const getMoodboardImage = getAssetImage;
export const deleteMoodboardImage = deleteAssetImage;
