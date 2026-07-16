import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { TPermissionOptions } from "@/api/auth/admin.ts";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidates?: QueryKey | readonly QueryKey[];
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
    // eslint-disable-next-line @typescript-eslint/max-params
    onSuccess: async (_data, _variables, _context, mutation) => {
      const keys = mutation.meta?.invalidates;
      if (!(Array.isArray(keys) && keys) || keys.length === 0) {
        return;
      }

      if (Array.isArray(keys[0])) {
        await Promise.all(
          keys.map(async (key) => {
            await apiClient.invalidateQueries({ queryKey: key as never });
          })
        );
      } else {
        await apiClient.invalidateQueries({ queryKey: keys });
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
  auth: {
    accounts: ["account"] as const,
    session: ["session"] as const,
    passkey: ["passkey"] as const,
  },
  admin: {
    all: ["admin"] as const,
    users: (options?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "users", options] as const,
    sessions: (options?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "sessions", options] as const,
    get permissions() {
      return [...queryKeys.admin.all, "permissions"] as const;
    },
    permission: (options: TPermissionOptions) => [
      ...queryKeys.admin.permissions,
      options,
    ],
  },
  profile: {
    all: ["profile"] as const,
    resumes: ["profile", "resumes"] as const,
    resumeView: (id: string) => ["profile", "resumeView", id] as const,
  },
  lookups: {
    roles: ["lookups", "roles"] as const,
    topics: ["lookups", "topics"] as const,
    industries: ["lookups", "industries"] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.jobs.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.jobs.all, "detail", id] as const,
  },
  keys: {
    all: ["keys"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.keys.all, "list", filters] as const,
  },
} as const;
