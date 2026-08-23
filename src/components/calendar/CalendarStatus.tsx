import { toast } from "sonner";
import { useLinkAccounts, useListAccounts } from "@/api/auth/account";
import { useSyncCalendar } from "@/api/calendar";
import { AsyncButton } from "@/components/ui/button/AsyncButton";
import { Spinner } from "@/components/ui/spinner";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

export const CalendarStatus = () => {
  const { data: accounts, isPending } = useListAccounts();
  const { mutateAsync: syncAll, isPending: isSyncing } = useSyncCalendar();
  const { mutateAsync: linkGoogle, isPending: isLinking } = useLinkAccounts();

  if (isPending) {
    return <Spinner className="h-4" />;
  }

  const googleAccount = accounts?.find((a) => a.providerId === "google");

  if (!googleAccount) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span>Google account not connected</span>
      </div>
    );
  }

  const accountScopes = (() => {
    if ("scopes" in googleAccount && Array.isArray(googleAccount.scopes)) {
      return googleAccount.scopes;
    }
    if (typeof googleAccount.scope === "string") {
      return googleAccount.scope.split(",");
    }
    return [];
  })();

  const hasCalendarScope = accountScopes.includes(CALENDAR_SCOPE);

  if (!hasCalendarScope) {
    const handleConnect = async () => {
      await linkGoogle({
        provider: "google",
        scopes: [CALENDAR_SCOPE],
        callbackURL: "/schedule",
      });
    };

    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span>Calendar access not granted</span>
        <AsyncButton
          isLoading={isLinking}
          onClick={handleConnect}
          size="sm"
          variant="link"
        >
          Grant Access
        </AsyncButton>
      </div>
    );
  }

  const handleSync = async () => {
    const result = await syncAll();
    toast.success(`Synced ${result.synced} events to Google Calendar`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs">
        Google Calendar connected
      </span>
      <AsyncButton
        isLoading={isSyncing}
        onClick={handleSync}
        size="sm"
        variant="outline"
      >
        Sync Now
      </AsyncButton>
    </div>
  );
};
