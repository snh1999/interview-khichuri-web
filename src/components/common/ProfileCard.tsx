import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useSession } from "@/lib/auth/auth-client.ts";

export const ProfileCard = ({
  isCompact,
}: Readonly<{
  isCompact?: boolean;
}>) => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <>
      <div className="relative">
        <Avatar
          className={isCompact ? undefined : "size-14"}
          size={isCompact ? "lg" : undefined}
        >
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{user.name[0] ?? "?"}</AvatarFallback>
        </Avatar>
        {isCompact ? (
          <span className="absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2 ring-card" />
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
