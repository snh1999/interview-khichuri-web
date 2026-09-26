import { type DBSchema, type IDBPDatabase, openDB } from "idb";

const ARCHIVE_DB_NAME = "khichuri-localstorage-archive";
const ARCHIVE_DB_VERSION = 1;
const VALUES_STORE = "values";

export type TArchivedValues = Record<string, string>;

interface IArchivedValues {
  userId: string;
  values: TArchivedValues;
}

interface IStorageArchiveDb extends DBSchema {
  values: {
    key: string;
    value: IArchivedValues;
  };
}

// Its own latch rather than a shared one: `indexdb.ts` caches a single promise
// bound to that database's name, so reusing it here would hand back the wrong
// database. The promise is stored before awaiting so a StrictMode double-invoke
// cannot open two connections.
let dbPromise: Promise<IDBPDatabase<IStorageArchiveDb>> | null = null;

const getArchiveDb = (): Promise<IDBPDatabase<IStorageArchiveDb>> => {
  dbPromise ??= openDB<IStorageArchiveDb>(ARCHIVE_DB_NAME, ARCHIVE_DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(VALUES_STORE, { keyPath: "userId" });
    },
  });
  return dbPromise;
};

export const getArchivedValues = async (
  userId: string
): Promise<TArchivedValues | null> => {
  const db = await getArchiveDb();
  const entry = await db.get(VALUES_STORE, userId);
  return entry?.values ?? null;
};

export const putArchivedValues = async (
  userId: string,
  values: TArchivedValues
): Promise<void> => {
  const db = await getArchiveDb();
  await db.put(VALUES_STORE, { userId, values });
};
