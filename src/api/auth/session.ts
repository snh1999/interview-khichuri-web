import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/api";
import {
  listSessions,
  revokeOtherSessions,
  revokeSession,
  unwrapBetterAuth,
} from "@/lib/auth/auth-client.ts";

export const useListSessions = () =>
  useSuspenseQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => unwrapBetterAuth(listSessions()),
  });

export const useRevokeOtherSessions = () =>
  useMutation({
    mutationFn: async () =>
      revokeOtherSessions(undefined, {
        onError: (error) => {
          toast.error(error.error.message);
        },
      }),
    meta: { invalidates: queryKeys.auth.session },
  });

export const useRevokeSession = () =>
  useMutation({
    mutationFn: async ({ token }: { token: string }) =>
      revokeSession(
        { token },
        {
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      ),
    meta: { invalidates: queryKeys.auth.session },
  });
