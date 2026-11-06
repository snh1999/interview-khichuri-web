import type { SessionWithImpersonatedBy } from "better-auth/client/plugins";
import { type ReactNode, useCallback } from "react";
import type {
  IAdminUser,
  IAdminUserCounts,
  IAdminUserDetail,
  IAdminUserProfile,
} from "@/api/admin";
import { useAdminUser } from "@/api/admin";
import {
  useAdminUserSessions,
  useRevokeUserSession,
} from "@/api/auth/admin.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { formatDate, formatDateTime, formatRelative } from "@/lib/date";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
}

const COUNT_LABELS = [
  ["jobs", "Jobs"],
  ["prepSessions", "Prep sessions"],
  ["interviews", "Interviews"],
  ["resumes", "Resumes"],
  ["notes", "Notes"],
  ["prompts", "Prompts"],
  ["apiKeys", "API keys"],
  ["calendarEvents", "Calendar events"],
] as const;

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-2">
    <h3 className="font-heading text-sm font-medium">{title}</h3>
    {children}
  </section>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start justify-between gap-4 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="max-w-[70%] text-right break-words">{children}</span>
  </div>
);

const MetadataSection = ({ user }: { user: IAdminUser }) => (
  <Section title="Metadata">
    <Field label="ID">{user.id}</Field>
    <Field label="Role">{user.role ?? "user"}</Field>
    <Field label="Email verified">
      {user.emailVerified ? (
        <Badge variant="secondary">Verified</Badge>
      ) : (
        <Badge variant="outline">Unverified</Badge>
      )}
    </Field>
    <Field label="Status">
      {user.banned ? (
        <Badge variant="destructive">Banned</Badge>
      ) : (
        <Badge variant="outline">Active</Badge>
      )}
    </Field>
    {user.banned ? (
      <>
        <Field label="Ban reason">{user.banReason ?? "No reason"}</Field>
        <Field label="Ban expires">
          {user.banExpires ? formatDateTime(user.banExpires) : "Never"}
        </Field>
      </>
    ) : null}
    <Field label="Created">{formatDate(user.createdAt)}</Field>
    <Field label="Updated">{formatDate(user.updatedAt)}</Field>
  </Section>
);

const ProfileSection = ({ profile }: { profile: IAdminUserProfile | null }) => (
  <Section title="Profile">
    {profile ? (
      <>
        <Field label="Name">
          {[profile.firstName, profile.lastName].filter(Boolean).join(" ")}
        </Field>
        <Field label="Location">{profile.location ?? "—"}</Field>
        <Field label="Country">{profile.country ?? "—"}</Field>
      </>
    ) : (
      <p className="text-muted-foreground text-xs">No profile set up.</p>
    )}
  </Section>
);

const ActivitySection = ({ counts }: { counts: IAdminUserCounts }) => (
  <Section title="Activity">
    <div className="grid grid-cols-2 gap-2">
      {COUNT_LABELS.map(([key, label]) => (
        <div className="rounded-md border p-2 text-xs" key={key}>
          <div className="text-muted-foreground">{label}</div>
          <div className="font-heading text-sm font-medium">{counts[key]}</div>
        </div>
      ))}
    </div>
  </Section>
);

const ProvidersSection = ({ providers }: { providers: string[] }) => (
  <Section title="Providers">
    {providers.length ? (
      <div className="flex flex-wrap gap-1">
        {providers.map((provider) => (
          <Badge key={provider} variant="outline">
            {provider}
          </Badge>
        ))}
      </div>
    ) : (
      <p className="text-muted-foreground text-xs">No linked providers.</p>
    )}
  </Section>
);

const PasskeysSection = ({ count }: { count: number }) => (
  <Section title="Passkeys">
    <Field label="Registered">
      {count === 0 ? "None" : `${count} passkey${count === 1 ? "" : "s"}`}
    </Field>
  </Section>
);

const SessionRow = ({
  session,
  onRevoke,
}: {
  session: SessionWithImpersonatedBy;
  onRevoke: (sessionToken: string) => void;
}) => {
  const handleRevoke = useCallback(
    () => onRevoke(session.token),
    [onRevoke, session.token]
  );

  return (
    <li className="flex items-start justify-between gap-3 rounded-md border p-3">
      <div className="flex flex-col gap-1 text-xs">
        <span className="font-medium">
          {session.userAgent ?? "Unknown device"}
        </span>
        <span className="text-muted-foreground">
          {session.ipAddress ?? "Unknown IP"}
        </span>
        <span className="text-muted-foreground">
          Started {formatDateTime(session.createdAt)} · expires{" "}
          {formatRelative(session.expiresAt)}
        </span>
        {session.impersonatedBy ? (
          <Badge variant="outline">Impersonation</Badge>
        ) : null}
      </div>
      <Button onClick={handleRevoke} size="xs" variant="outline">
        Revoke
      </Button>
    </li>
  );
};

const SessionsSection = ({
  sessions,
  isPending,
  onRevoke,
}: {
  sessions: SessionWithImpersonatedBy[] | undefined;
  isPending: boolean;
  onRevoke: (sessionToken: string) => void;
}) => (
  <Section title="Sessions">
    {isPending ? <Spinner /> : null}
    {isPending || sessions?.length ? null : (
      <p className="text-muted-foreground text-xs">No active sessions.</p>
    )}
    {sessions?.length ? (
      <ul className="flex flex-col gap-2">
        {sessions.map((session) => (
          <SessionRow key={session.id} onRevoke={onRevoke} session={session} />
        ))}
      </ul>
    ) : null}
  </Section>
);

const UserDetails = ({
  data,
  sessions,
  sessionsPending,
  onRevokeSession,
}: {
  data: IAdminUserDetail;
  sessions: SessionWithImpersonatedBy[] | undefined;
  sessionsPending: boolean;
  onRevokeSession: (sessionToken: string) => void;
}) => (
  <>
    <MetadataSection user={data.user} />
    <ProfileSection profile={data.profile} />
    <ActivitySection counts={data.counts} />
    <ProvidersSection providers={data.providers} />
    <PasskeysSection count={data.passkeys} />
    <SessionsSection
      isPending={sessionsPending}
      onRevoke={onRevokeSession}
      sessions={sessions}
    />
  </>
);

export const UserDetailSheet = ({ open, onOpenChange, userId }: IProps) => {
  const { data, error, isPending } = useAdminUser(open ? userId : undefined);
  const { data: sessions, isPending: sessionsPending } = useAdminUserSessions(
    open ? userId : undefined
  );
  const revokeSession = useRevokeUserSession();

  const handleRevokeSession = useCallback(
    (sessionToken: string) => {
      if (userId) {
        revokeSession.mutate({ userId, sessionToken });
      }
    },
    [revokeSession, userId]
  );

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{data?.user.name ?? "User details"}</SheetTitle>
          <SheetDescription>{data?.user.email ?? userId}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-6 pb-6">
          {isPending ? <Spinner /> : null}
          {error ? (
            <p className="text-destructive text-xs">{error.message}</p>
          ) : null}
          {data ? (
            <UserDetails
              data={data}
              onRevokeSession={handleRevokeSession}
              sessions={sessions?.sessions}
              sessionsPending={sessionsPending}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};
