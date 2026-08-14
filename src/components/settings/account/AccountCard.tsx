import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type { Account } from "better-auth";
import { useLinkAccounts, useUnlinkAccounts } from "@/api/auth";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  oauthProviders,
  type TOauthProviders,
} from "@/lib/auth/auth.helpers.tsx";

interface IProps {
  provider: TOauthProviders;
  account?: Account;
  disableUnlink?: boolean;
}

export const AccountCard = ({
  provider,
  account,
  disableUnlink = false,
}: Readonly<IProps>) => {
  const { mutateAsync: linkAccounts } = useLinkAccounts();
  const { mutateAsync: unlinkAccount } = useUnlinkAccounts();

  const providerDetails = oauthProviders.find(
    (authProvider) => authProvider.id === provider
  );

  const handleLinkAccount = () => linkAccounts(provider);
  const handleUnlinkAccount = () =>
    unlinkAccount({
      // biome-ignore lint/style/noNonNullAssertion: <used only when account is defined>
      account: account!,
      providerId: provider,
    });

  if (!providerDetails) {
    return null;
  }

  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <providerDetails.icon className="size-5" />
            <CardHeader>
              <CardTitle className="text-xs">{providerDetails.name}</CardTitle>
              <CardDescription>
                {account
                  ? `Linked on ${new Date(account.createdAt).toLocaleDateString()}`
                  : `Connect your ${providerDetails.name} account for easier sign-in`}
              </CardDescription>
            </CardHeader>
            <div>
              <p className="" />
            </div>
          </div>
          {account ? (
            <AuthActionButton
              action={handleUnlinkAccount}
              disabled={disableUnlink}
              size="sm"
              successMessage={`Removed ${providerDetails.name} account`}
              variant="destructive"
            >
              <TrashIcon />
              Unlink
            </AuthActionButton>
          ) : (
            <AuthActionButton
              action={handleLinkAccount}
              size="sm"
              successMessage={`Redirecting to ${providerDetails.name}`}
              variant="outline"
            >
              <PlusIcon />
              Link
            </AuthActionButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
