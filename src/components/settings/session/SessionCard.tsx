import { MonitorIcon, PhoneIcon, TrashIcon } from "@phosphor-icons/react";
import type { Session } from "better-auth/types";
import { format } from "date-fns";
import { UAParser } from "ua-parser-js";
import { useRevokeSession } from "@/api/auth";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

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
    if (userAgentInfo == null) {
      return "Unknown Device";
    }
    if (userAgentInfo.browser.name == null && userAgentInfo.os.name == null) {
      return "Unknown Device";
    }

    if (userAgentInfo.browser.name == null) {
      return userAgentInfo.os.name;
    }
    if (userAgentInfo.os.name == null) {
      return userAgentInfo.browser.name;
    }

    return `${userAgentInfo.browser.name}, ${userAgentInfo.os.name}`;
  }

  function formatDate(date: Date) {
    return `${format(date, "dd MMMM, yyyy")} (${format(date, "h:mm a")})`;
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {userAgentInfo?.device.type === "mobile" ? (
            <PhoneIcon size={25} />
          ) : (
            <MonitorIcon size={25} />
          )}
          {getBrowserInformation()}
        </CardTitle>
        <CardAction>
          {isCurrentSession ? (
            <Badge>Current Session</Badge>
          ) : (
            <AuthActionButton
              action={() => revokeSession({ token: session.token })}
              successMessage="Session revoked"
              variant="destructive"
            >
              <TrashIcon />
            </AuthActionButton>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex justify-between text-muted-foreground">
        <p>Created: {formatDate(session.createdAt)}</p>
        <p>Expires: {formatDate(session.expiresAt)}</p>
      </CardContent>
    </Card>
  );
};
