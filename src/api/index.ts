import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { TPermissionOptions } from "@/api/auth/admin.ts";
import type { IAtsScoreFilter } from "@/lib/indexdb";

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
        if (Array.isArray(removeKeys[0])) {
          for (const key of removeKeys) {
            apiClient.removeQueries({ queryKey: key as never });
          }
        } else {
          apiClient.removeQueries({ queryKey: removeKeys as never });
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
    users: (options?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "users", options] as const,
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
    detail: (id: string) => [...queryKeys.jobs.all, "detail", id] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.jobs.all, "list", filters] as const,
  },
  keys: {
    all: ["keys"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.keys.all, "list", filters] as const,
  },
  lookups: {
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
  resumes: {
    all: ["resumes"] as const,
    list: () => [...queryKeys.resumes.all, "list"] as const,
    review: ["reviews"] as const,
    resumeById: (id: string) =>
      [...queryKeys.resumes.all, "detail", id] as const,
    resumeBySlug: (slug: string) =>
      [...queryKeys.resumes.all, "public", slug] as const,
    // using different key to stop user from refetching
    resumeView: (id: string) =>
      [...queryKeys.resumes.all, "resumeView", id] as const,
    ats: {
      get all() {
        return [...queryKeys.resumes.review, "ats"] as const;
      },
      filter: (filter?: IAtsScoreFilter) =>
        [...queryKeys.resumes.ats.all, filter ?? {}] as const,
    },
    reviewById: (resumeId: string) =>
      [
        ...queryKeys.resumes.resumeById(resumeId),
        ...queryKeys.resumes.review,
      ] as const,
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
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.sessions.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.sessions.all, "detail", id] as const,
    detailsAndList: (id: string) =>
      [queryKeys.sessions.list(), queryKeys.sessions.detail(id)] as const,
    questions: (sessionId: string) =>
      [...queryKeys.sessions.all, "questions", sessionId] as const,
  },
} as const;
