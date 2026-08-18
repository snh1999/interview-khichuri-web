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
  type IProvider,
  oauthProviders,
  type TOauthProviders,
} from "@/lib/auth/auth.helpers.tsx";

interface IProps {
  provider: TOauthProviders;
  account?: Account;
  disableUnlink?: boolean;
}

export const AccountCard = (props: Readonly<IProps>) => {
  const { provider, account } = props;
  const providerDetails = oauthProviders.find(
    (authProvider) => authProvider.id === provider
  );

  if (!providerDetails) {
    return (
      <Card size="sm">
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Unknown provider: {provider}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <providerDetails.icon
            className="size-5"
            color={providerDetails.color}
            weight={providerDetails.weight ?? "regular"}
          />
          <div>
            <CardTitle className="text-xs">{providerDetails.name}</CardTitle>
            <CardDescription>
              {account
                ? `Linked on ${new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(account.createdAt))}`
                : `Connect your ${providerDetails.name} account for easier sign-in`}
            </CardDescription>
          </div>
        </div>
        <ActionButton
          className="flex items-center pb-1"
          providerDetails={providerDetails}
          {...props}
        />
      </CardHeader>
    </Card>
  );
};

const ActionButton = ({
  providerDetails,
  provider,
  account,
  className,
  disableUnlink = false,
}: Readonly<
  IProps & {
    providerDetails: IProvider;
    className?: string;
  }
>) => {
  const { mutateAsync: linkAccounts } = useLinkAccounts();
  const { mutateAsync: unlinkAccount } = useUnlinkAccounts();
  const handleLinkAccount = () => linkAccounts(provider);

  if (!account) {
    return (
      <AuthActionButton
        action={handleLinkAccount}
        className={className}
        successMessage={`Redirecting to ${providerDetails.name}`}
        variant="outline"
      >
        <PlusIcon />
        Link
      </AuthActionButton>
    );
  }

  const handleUnlinkAccount = () =>
    unlinkAccount({ account, providerId: provider });

  return (
    <AuthActionButton
      action={handleUnlinkAccount}
      className={className}
      disabled={disableUnlink}
      successMessage={`Removed ${providerDetails.name} account`}
      variant="destructive"
    >
      <TrashIcon />
      Unlink
    </AuthActionButton>
  );
};
