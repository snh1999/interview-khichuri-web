import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { TPermissionOptions } from "@/api/auth/admin.ts";
import type { IAtsScoreFilter } from "@/lib/storage/indexdb.ts";

type TQueryFn =
  | QueryKey
  | readonly QueryKey[]
  | ((variables: never) => QueryKey | readonly QueryKey[]);

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidates?: TQueryFn;
      removes?: TQueryFn;
    };
  }
}

const removeWhenUnobserved = (queryKey: QueryKey) => {
  const cache = apiClient.getQueryCache();
  for (const query of cache.findAll({ queryKey })) {
    if (query.getObserversCount() === 0) {
      cache.remove(query);
      continue;
    }
    const unsubscribe = cache.subscribe((event) => {
      if (
        event.type === "observerRemoved" &&
        event.query === query &&
        query.getObserversCount() === 0
      ) {
        cache.remove(query);
        unsubscribe();
      }
    });
  }
};

export const apiClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: async (_data, variables, _context, mutation) => {
      const resolve = (val: unknown) =>
        typeof val === "function" ? val(variables) : val;

      const keys = resolve(mutation.meta?.invalidates);
      if (Array.isArray(keys) && keys.length > 0) {
        if (Array.isArray(keys[0])) {
          await Promise.all(
            keys.map((key) =>
              apiClient.invalidateQueries({ queryKey: key as never })
            )
          );
        } else {
          await apiClient.invalidateQueries({ queryKey: keys as never });
        }
      }

      const removeKeys = resolve(mutation.meta?.removes);
      if (Array.isArray(removeKeys) && removeKeys.length > 0) {
        const keyList = Array.isArray(removeKeys[0])
          ? removeKeys
          : [removeKeys];
        for (const key of keyList) {
          removeWhenUnobserved(key as QueryKey);
        }
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  admin: {
    all: ["admin"] as const,
    permission: (options: TPermissionOptions) => [
      ...queryKeys.admin.permissions,
      options,
    ],
    get permissions() {
      return [...queryKeys.admin.all, "permissions"] as const;
    },
    sessions: (options?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "sessions", options] as const,
    get stats() {
      return [...queryKeys.admin.all, "stats"] as const;
    },
    get health() {
      return [...queryKeys.admin.all, "health"] as const;
    },
    users: (options?: Record<string, unknown>) =>
      options
        ? ([...queryKeys.admin.all, "users", options] as const)
        : ([...queryKeys.admin.all, "users"] as const),
    user: (id: string) =>
      [...queryKeys.admin.all, "users", "detail", id] as const,
    prompts: (options?: Record<string, unknown>) =>
      options
        ? ([...queryKeys.admin.all, "prompts", options] as const)
        : ([...queryKeys.admin.all, "prompts"] as const),
    companies: (options?: Record<string, unknown>) =>
      options
        ? ([...queryKeys.admin.all, "companies", options] as const)
        : ([...queryKeys.admin.all, "companies"] as const),
    jobs: (options?: Record<string, unknown>) =>
      options
        ? ([...queryKeys.admin.all, "jobs", options] as const)
        : ([...queryKeys.admin.all, "jobs"] as const),
    feedback: (options?: Record<string, unknown>) =>
      options
        ? ([...queryKeys.admin.all, "feedback", options] as const)
        : ([...queryKeys.admin.all, "feedback"] as const),
    get failedJobs() {
      return [...queryKeys.admin.all, "failed-jobs"] as const;
    },
    get aiStatus() {
      return [...queryKeys.admin.all, "ai-status"] as const;
    },
  },
  auth: {
    accounts: ["account"] as const,
    passkey: ["passkey"] as const,
    session: ["session"] as const,
  },
  calendar: {
    all: ["calendar"] as const,
    events: ["calendar", "events"] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    get list() {
      return [...queryKeys.jobs.all, "list"] as const;
    },
    listWithFilter: (filters?: Record<string, unknown>) =>
      [...queryKeys.jobs.list, filters] as const,
    detail: (id: string) => [...queryKeys.jobs.all, "detail", id] as const,
    discover: (filters?: Record<string, unknown>) =>
      [...queryKeys.jobs.all, "discover", filters] as const,
    companyJobs: (companyId: number, filters?: Record<string, unknown>) =>
      [...queryKeys.jobs.all, "company", companyId, filters] as const,
    detailsAndList: (id: string) =>
      [queryKeys.jobs.list, queryKeys.jobs.detail(id)] as const,
  },
  keys: {
    all: ["keys"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.keys.all, "list", filters] as const,
  },
  lookups: {
    company: (id: number) => ["lookups", "company", id] as const,
    categories: ["lookups", "categories"] as const,
    industries: ["lookups", "industries"] as const,
    roles: ["lookups", "roles"] as const,
    topics: ["lookups", "topics"] as const,
    companies: ["lookups", "companies"] as const,
  },
  interviews: {
    all: ["interviews"] as const,
    detail: (id: string) =>
      [...queryKeys.interviews.all, "detail", id] as const,
    bySession: (sessionId: string) =>
      [...queryKeys.interviews.all, "bySession", sessionId] as const,
    list: (options?: Record<string, unknown>) =>
      [...queryKeys.interviews.all, "list", options ?? {}] as const,
    draft: (id: string) => [...queryKeys.interviews.all, "draft", id] as const,
    archive: (id: string) =>
      [...queryKeys.interviews.all, "archive", id] as const,
  },
  notes: {
    all: ["notes"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.notes.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.notes.all, "detail", id] as const,
    detailsAndList: (id: string) =>
      [queryKeys.notes.list(), queryKeys.notes.detail(id)] as const,
  },
  profile: {
    all: ["profile"] as const,
  },
  portfolio: {
    all: ["portfolio"] as const,
    list: () => [...queryKeys.portfolio.all, "list"] as const,
    detail: (id: string) => [...queryKeys.portfolio.all, "detail", id] as const,
  },
  resumes: {
    all: ["resumes"] as const,
    get review() {
      return [...queryKeys.resumes.all, "reviews"] as const;
    },
    get list() {
      return [...queryKeys.resumes.all, "list"] as const;
    },
    resumeById: (id: string) =>
      [...queryKeys.resumes.all, "detail", id] as const,
    resumeBySlug: (slug: string) =>
      [...queryKeys.resumes.all, "public", slug] as const,
    // using different key to stop user from refetching
    resumeView: (id: string) => [...queryKeys.resumes.all, "view", id] as const,
    ats: {
      get all() {
        return [...queryKeys.resumes.review, "ats"] as const;
      },
      filter: (filter?: IAtsScoreFilter) =>
        [...queryKeys.resumes.ats.all, filter ?? {}] as const,
    },
    reviewById: (resumeId: string) =>
      [...queryKeys.resumes.review, "detail", resumeId] as const,
  },
  prompts: {
    all: ["prompts"] as const,
    get defaults() {
      return [...queryKeys.prompts.all, "defaults"] as const;
    },
    details: (id: number) => [...queryKeys.prompts.all, "detail", id] as const,
    liked: (filters?: Record<string, unknown>) =>
      [...queryKeys.prompts.all, "liked", filters] as const,
    list: (scope: string, filters?: Record<string, unknown>) =>
      [...queryKeys.prompts.all, scope, filters] as const,
  },
  sessions: {
    all: ["sessions"] as const,
    get list() {
      return [...queryKeys.sessions.all, "list"] as const;
    },
    listWithFilter: (filters?: Record<string, unknown>) =>
      [...queryKeys.sessions.list, filters] as const,
    detail: (id: string) => [...queryKeys.sessions.all, "detail", id] as const,
    detailsAndList: (id: string) =>
      [queryKeys.sessions.list, queryKeys.sessions.detail(id)] as const,
    questions: (sessionId: string) =>
      [...queryKeys.sessions.all, "questions", sessionId] as const,
  },
} as const;
