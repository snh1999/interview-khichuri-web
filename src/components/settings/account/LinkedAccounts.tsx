import { useListAccounts } from "@/api/auth";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard.tsx";
import { AccountCard } from "@/components/settings/account/AccountCard.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
  SUPPORTED_OAUTH_PROVIDERS,
  type TOauthProviders,
} from "@/lib/auth/auth.helpers.tsx";

export const AccountsTab = () => (
  <AppErrorSuspense fallback={AccountSkeleton}>
    <LinkedAccounts />
  </AppErrorSuspense>
);
const LinkedAccounts = () => {
  const { data: accounts, isPending } = useListAccounts();

  if (isPending || !accounts) {
    return <Spinner />;
  }

  const disableUnlink = accounts.length === 1;
  const nonCredentialAccounts = accounts.filter(
    (account) => account.providerId !== "credential"
  );
  const hideOtherAccounts =
    SUPPORTED_OAUTH_PROVIDERS.length === nonCredentialAccounts.length;

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Linked Accounts</h3>

          {nonCredentialAccounts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No linked accounts found
            </div>
          ) : (
            <div className="space-y-3">
              {nonCredentialAccounts.map((account) => (
                <AccountCard
                  account={account}
                  disableUnlink={disableUnlink}
                  key={account.id}
                  provider={account.providerId as TOauthProviders}
                />
              ))}
            </div>
          )}
        </div>

        {hideOtherAccounts ? null : (
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Link Other Accounts</h3>
            <div className="grid gap-3">
              {SUPPORTED_OAUTH_PROVIDERS.filter(
                (provider) =>
                  !nonCredentialAccounts.find(
                    (acc) => acc.providerId === provider
                  )
              ).map((provider) => (
                <AccountCard key={provider} provider={provider} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AccountSkeleton = () => (
  <SkeletonCard noFooter>
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
  </SkeletonCard>
);
