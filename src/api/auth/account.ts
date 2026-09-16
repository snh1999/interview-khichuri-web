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
    mutationFn: async ({ account }: { account: Account }) =>
      await unlinkAccount(
        {
          accountId: account.accountId,
        },
        {
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      ),
    meta: { invalidates: queryKeys.auth.accounts },
  });

export const useLinkAccounts = () =>
  useMutation({
    mutationFn: async (
      input:
        | TOauthProviders
        | { provider: TOauthProviders; scopes?: string[]; callbackURL?: string }
    ) => {
      const opts = typeof input === "string" ? { provider: input } : input;
      return await linkSocial(opts.provider, {
        scopes: opts.scopes,
        callbackURL: opts.callbackURL,
      });
    },
    meta: { invalidates: queryKeys.auth.accounts },
  });
