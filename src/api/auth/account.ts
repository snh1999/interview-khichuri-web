import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type { Account } from "better-auth";
import { toast } from "sonner";
import { queryKeys } from "@/api";
import type { TOauthProviders } from "@/lib/auth/auth.helpers.tsx";
import {
  linkSocial,
  listAccounts,
  unlinkAccount,
  unwrapBetterAuth,
} from "@/lib/auth/auth-client.ts";

export const useListAccounts = () =>
  useSuspenseQuery({
    queryKey: queryKeys.auth.accounts,
    queryFn: async () => await unwrapBetterAuth(listAccounts()),
  });

export const useUnlinkAccounts = () =>
  useMutation({
    mutationFn: async ({
      account,
      providerId,
    }: {
      account: Account | null;
      providerId: TOauthProviders;
    }) => {
      if (account === null) {
        throw new Error("Account not found");
      }
      return await unlinkAccount(
        {
          accountId: account.accountId,
          providerId,
        },
        {
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
    },
    meta: { invalidates: queryKeys.auth.accounts },
  });

export const useLinkAccounts = () =>
  useMutation({
    mutationFn: async (provider: TOauthProviders) => await linkSocial(provider),
    meta: { invalidates: queryKeys.auth.accounts },
  });
