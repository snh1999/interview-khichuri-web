import { Badge } from "@/components/ui/badge.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { MonitorIcon, PhoneIcon, TrashIcon } from "@phosphor-icons/react";
import { UAParser } from "ua-parser-js";
import type { Session } from "better-auth/types";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { useRevokeSession } from "@/api/auth";

interface IProps {
  session: Session;
  isCurrentSession?: boolean;
}

export const SessionCard = ({
  session,
  isCurrentSession = false,
}: Readonly<IProps>) => {
  const { mutateAsync: revokeSession } = useRevokeSession();

  // eslint-disable-next-line react-hooks/capitalized-calls
  const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null;

  function getBrowserInformation() {
    if (userAgentInfo == null) return "Unknown Device";
    if (userAgentInfo.browser.name == null && userAgentInfo.os.name == null) {
      return "Unknown Device";
    }

    if (userAgentInfo.browser.name == null) return userAgentInfo.os.name;
    if (userAgentInfo.os.name == null) return userAgentInfo.browser.name;

    return `${userAgentInfo.browser.name}, ${userAgentInfo.os.name}`;
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  }

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-3">
          {userAgentInfo?.device.type === "mobile" ? (
            <PhoneIcon size={32} />
          ) : (
            <MonitorIcon size={32} />
          )}
          <CardTitle>{getBrowserInformation()}</CardTitle>
        </div>
        {isCurrentSession ? <Badge>Current Session</Badge> : null}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs">
              Created: {formatDate(session.createdAt)}
            </p>
            <p className="text-muted-foreground text-xs">
              Expires: {formatDate(session.expiresAt)}
            </p>
          </div>
          {!isCurrentSession && (
            <AuthActionButton
              variant="destructive"
              size="sm"
              action={() => revokeSession({ token: session.token })}
              successMessage="Session revoked"
            >
              <TrashIcon />
            </AuthActionButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
