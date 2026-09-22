import BoringAvatar from "boring-avatars";
import { Badge } from "@/components/ui/badge.tsx";
import { useSession } from "@/lib/auth/auth-client.ts";
import { useAppStore } from "@/store/appStore.ts";

export const ProfileCard = ({
  isCompact,
  size,
  hideText,
}: Readonly<{
  isCompact?: boolean;
  size?: number;
  hideText?: boolean;
}>) => {
  const { data: session } = useSession();
  const avatarVariant = useAppStore((state) => state.avatar);

  if (!session) {
    return null;
  }

  const { user } = session;

  const avatar = (
    <BoringAvatar
      name={user.name ?? user.email ?? "User"}
      size={size ?? 56}
      variant={avatarVariant}
    />
  );

  if (hideText) {
    return avatar;
  }

  return (
    <>
      <div className="relative">
        {avatar}
        {isCompact ? (
          <span className="absolute right-0 bottom-0 block size-2 rounded-full bg-signal-success ring-2 ring-card" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col items-start">
        <span
          className={
            isCompact
              ? "font-semibold text-foreground text-lg"
              : "font-bold text-2xl text-foreground"
          }
        >
          {user.name}
        </span>
        <span
          className={
            isCompact
              ? "text-base text-muted-foreground"
              : "text-muted-foreground text-xs"
          }
        >
          {user.email}
        </span>
      </div>
      {!isCompact && (
        <div data-slot="card-action">
          <Badge variant="secondary">{user.role}</Badge>
        </div>
      )}
    </>
  );
};
