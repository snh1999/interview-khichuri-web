import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/api";
import {
  listAccounts,
  linkSocial,
  unlinkAccount,
} from "@/lib/auth/auth-client.ts";

import type { Account } from "better-auth";
import type { TOauthProviders } from "@/lib/auth/auth.helpers.tsx";

export const useListAccounts = () =>
  useSuspenseQuery({
    queryKey: queryKeys.auth.accounts,
    queryFn: async () => listAccounts(),
    select: (response) => response.data,
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
        return { error: { message: "Account not found" } };
      }
      return unlinkAccount(
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
    mutationFn: async (provider: TOauthProviders) => linkSocial(provider),
    meta: { invalidates: queryKeys.auth.accounts },
  });
