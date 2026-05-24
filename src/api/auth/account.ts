import { useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { listAccounts } from "@/lib/auth/auth-client.ts";

export const useListAccounts = () =>
  useSuspenseQuery({
    queryKey: queryKeys.auth.accounts,
    queryFn: async () => listAccounts(),
    select: (response) => response.data,
  });
