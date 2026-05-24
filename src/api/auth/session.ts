import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import {
  listSessions,
  revokeOtherSessions,
  revokeSession,
} from "@/lib/auth/auth-client.ts";

export const useListSessions = () =>
  useSuspenseQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => listSessions(),
    select: (response) => response.data,
  });

export const useRevokeOtherSessions = () =>
  useMutation({
    mutationFn: async () => revokeOtherSessions(),
    meta: { invalidates: queryKeys.auth.session },
  });

export const useRevokeSession = () =>
  useMutation({
    mutationFn: async ({ token }: { token: string }) =>
      revokeSession({ token }),
    meta: { invalidates: queryKeys.auth.session },
  });
