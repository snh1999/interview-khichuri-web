import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TPermissionOptions } from "@/api/auth/admin.ts";

export const apiClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message);
    },
  }),
  mutationCache: new MutationCache({
    // eslint-disable-next-line @typescript-eslint/max-params
    onSuccess: async (_data, _variables, _context, mutation) => {
      if (mutation.meta?.invalidates) {
        await apiClient.invalidateQueries(mutation.meta.invalidates);
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
    users: () => [...queryKeys.admin.all, "users"] as const,
    get permissions() {
      return [...queryKeys.admin.all, "permissions"] as const;
    },
    permission: (options: TPermissionOptions) => [
      queryKeys.admin.permissions,
      options,
    ],
  },
} as const;
