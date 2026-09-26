import { useEffect, useState } from "react";
import type { PersistStorage } from "zustand/middleware";
import { apiClient } from "@/api";
import {
  getArchivedValues,
  putArchivedValues,
  type TArchivedValues,
} from "@/lib/storageArchive";
import { useAppStore } from "@/store/appStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useResumeStore } from "@/store/resumeStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useJobsStore } from "@/store/useJobsStore";

/**
 * Stands in for a store's real `persist` storage: reports "nothing stored" and
 * discards every write. zustand hands the whole `{ state, version }` object to
 * `setItem`, so the mute only has to ignore its arguments. Structurally
 * assignable to `PersistStorage<T, unknown>` for every store `T`.
 */
interface TPersistWriteMute {
  getItem: () => null;
  setItem: () => void;
  removeItem: () => void;
}

const SILENT_STORAGE: TPersistWriteMute = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

/**
 * The slice of a zustand `persist` store this hook drives. Generic in the store
 * and persisted shapes so `setOptions` stays contravariantly sound — widening
 * its `storage` to `unknown` would reject every real store.
 */
interface TScopedStore<TState, TPersisted> {
  persist: {
    getOptions: () => { storage?: PersistStorage<TPersisted, unknown> };
    setOptions: (options: {
      storage?: PersistStorage<TPersisted, unknown>;
    }) => void;
    rehydrate: () => Promise<void> | void;
  };
  getInitialState: () => TState;
  setState: (state: TState, replace: true) => void;
}

interface TUserScopedStore {
  /** The `localStorage` key, which is also the store's `persist` name. */
  key: string;
  /**
   * Repoint persist writes at `mute`, returning a function that puts the old
   * storage back. The captured storage is always a real adapter: every mute is
   * paired with a restore in a `finally`, so a store is never muted twice.
   */
  muteWrites: (mute: TPersistWriteMute) => () => void;
  /** Replace in-memory state with the store's pure defaults. */
  resetToDefaults: () => void;
  rehydrate: () => Promise<void> | void;
}

// `userId` is persisted by the app store, so its raw localStorage entry doubles
// as the ownership tag — the key cannot be renamed independently of the field.
const APP_STORE_KEY = "app-store";

const userScopedStore = <TState, TPersisted>(
  key: string,
  store: TScopedStore<TState, TPersisted>
): TUserScopedStore => ({
  key,
  muteWrites: (mute) => {
    const previous = store.persist.getOptions().storage;
    store.persist.setOptions({ storage: mute });
    return () => {
      store.persist.setOptions({ storage: previous });
    };
  },
  resetToDefaults: () => {
    store.setState(store.getInitialState(), true);
  },
  rehydrate: () => store.persist.rehydrate(),
});

const USER_SCOPED_STORES: TUserScopedStore[] = [
  userScopedStore(APP_STORE_KEY, useAppStore),
  userScopedStore("interview-panes", useInterviewStore),
  userScopedStore("resume-store", useResumeStore),
  userScopedStore("schedule-ui", useScheduleStore),
  userScopedStore("job-filters-sort", useJobsStore),
];

const USER_SCOPED_KEYS = USER_SCOPED_STORES.map((store) => store.key);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// `localStorage.setItem` is atomic, so a half-written value is not the risk here —
// shape drift is. Both the wrapped (`{ state: … }`) and bare shapes are tolerated,
// and a throw must never reach the login path.
const tryParseTag = (): string | null => {
  try {
    const raw = localStorage.getItem(APP_STORE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) {
      return null;
    }
    const state = isPlainObject(parsed.state) ? parsed.state : parsed;
    return typeof state.userId === "string" ? state.userId : null;
  } catch {
    return null;
  }
};

const readUserScopedValues = (): TArchivedValues => {
  const values: TArchivedValues = {};
  for (const key of USER_SCOPED_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      values[key] = raw;
    }
  }
  return values;
};

// Rewriting the keys while `persist` is muted keeps the outgoing user's values
// from being flushed back over the incoming user's mid-swap. The region is
// deliberately synchronous: nothing inside it may await, so the restore cannot
// be stranded by a rejected promise. A `localStorage` failure (quota exceeded,
// private browsing) must not reject out of here either — the gate would never
// open again — so the swap completes against whatever keys did land.
const applyUserScopedValues = (incoming: TArchivedValues | null): void => {
  const restorers = USER_SCOPED_STORES.map((store) =>
    store.muteWrites(SILENT_STORAGE)
  );
  try {
    for (const key of USER_SCOPED_KEYS) {
      const raw = incoming?.[key];
      if (raw === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, raw);
      }
    }
    for (const store of USER_SCOPED_STORES) {
      store.resetToDefaults();
    }
  } catch (error: unknown) {
    console.error("[useLocalDataOnLogin/applyUserScopedValues]", error);
  } finally {
    for (const restore of restorers) {
      restore();
    }
  }
};

// zustand's `hydrate` already terminates in its own `.catch`, so this never
// rejects. The guard is here so the gate cannot be wedged by a future zustand
// change: a failed rehydrate leaves the stores at defaults, never stuck.
const rehydrateAll = async (): Promise<void> => {
  await Promise.all(USER_SCOPED_STORES.map((store) => store.rehydrate())).catch(
    (error: unknown) => {
      console.error("[useLocalDataOnLogin/rehydrateAll]", error);
    }
  );
};

// Returns whether this run completed without a newer run taking over.
const swapLocalDataFor = async (
  userId: string,
  isStale: () => boolean
): Promise<boolean> => {
  // Read the tag and drop the query cache before the first await, so no
  // `useSuspenseQuery` can resolve from the previous user's warm cache.
  const tag = tryParseTag();
  apiClient.clear();

  if (tag === userId) {
    await rehydrateAll();
    return !isStale();
  }

  // Archive the outgoing user before anything overwrites their values. Both
  // operations are handled independently: the payload is cosmetic, so a failed
  // archive or a failed read must degrade to defaults rather than throw.
  let incoming: TArchivedValues | null = null;
  if (tag) {
    try {
      await putArchivedValues(tag, readUserScopedValues());
    } catch (error: unknown) {
      console.error(
        "[useLocalDataOnLogin/swapLocalDataFor] archive write failed",
        error
      );
    }
  }
  try {
    incoming = await getArchivedValues(userId);
  } catch (error: unknown) {
    console.error(
      "[useLocalDataOnLogin/swapLocalDataFor] archive read failed",
      error
    );
  }

  // A newer run owns the state now. Impersonation rotates the session cookie
  // mid-run, so this is two different users rather than a repeat, and
  // idempotency does not cover it.
  if (isStale()) {
    return false;
  }

  applyUserScopedValues(incoming);
  await rehydrateAll();

  // Re-checked after the await: a run that went stale while rehydrating must not
  // stamp its own user onto the newer run's tag.
  if (isStale()) {
    return false;
  }
  // Written last and unmuted: inside the mute it would be discarded, before the
  // reset it would be clobbered, and before the rehydrate it would overwrite the
  // incoming user's restored values with defaults.
  useAppStore.setState({ userId });
  return true;
};

export const useLocalDataOnLogin = (
  userId: string | undefined
): { isSwapping: boolean } => {
  const [settledFor, setSettledFor] = useState<string | undefined>(undefined);
  // Derived rather than latched: with no signed-in user there is no local state
  // to establish, so the gate stays open and the auth pages render. A latch
  // either strands the spinner here or opens the gate mid-swap, because
  // `userId` resolves `undefined` → id across two effect runs.
  const isSwapping = Boolean(userId) && userId !== settledFor;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;
    const isStale = (): boolean => cancelled;
    const run = async (): Promise<void> => {
      const completed = await swapLocalDataFor(userId, isStale);
      if (completed) {
        setSettledFor(userId);
      }
    };

    // biome-ignore lint/complexity/noVoid: the swap is fire-and-forget; `isSwapping` gates the tree until it settles
    void run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { isSwapping };
};
