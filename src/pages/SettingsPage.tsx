import {
  ArrowLeftIcon,
  KeyIcon,
  LinkIcon,
  ShieldIcon,
  TrashIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { HOMEPAGE } from "@/app.constants.ts";
import { AccountsTab } from "@/components/settings/account/LinkedAccounts.tsx";
import { ProfileDangerZone } from "@/components/settings/ProfileDangerZone.tsx";
import { ProfileTab } from "@/components/settings/security/ProfileSecurity.tsx";
import { SessionTab } from "@/components/settings/session/SessionTab.tsx";
import { UpdateProfileForm } from "@/components/settings/update/UpdateProfileForm.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabs } from "@/hooks/useTabs.ts";
import { useSession } from "@/lib/auth/auth-client.ts";

const SettingsPage = () => {
  const { data: session } = useSession();

  const { currentTab, handleTabChange } = useTabs("profile");

  if (!session) {
    return null;
  }

  return (
    <div className="mx-auto my-6 max-w-4xl px-4">
      <div className="mb-8">
        <LinkButton className="mb-4" path={HOMEPAGE}>
          <ArrowLeftIcon className="mr-2 size-4" />
          Back to Home
        </LinkButton>

        <div className="flex items-center space-x-4">
          <Avatar className="size-14">
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>{session.user.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-1">
              <h1 className="font-bold text-3xl">
                {session.user.name || "User Profile"}
              </h1>
              <Badge>{session.user.role}</Badge>
            </div>
            <p className="text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
      </div>

      <Tabs
        className="space-y-2"
        onValueChange={handleTabChange}
        value={currentTab}
      >
        <TabsList className="w-full" variant="line">
          <TabsTrigger value="profile">
            <UserIcon />
            <span className="max-sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldIcon />
            <span className="max-sm:hidden">Security</span>
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <KeyIcon />
            <span className="max-sm:hidden">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <LinkIcon />
            <span className="max-sm:hidden">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="danger">
            <TrashIcon />
            <span className="max-sm:hidden">Danger</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UpdateProfileForm user={session.user} />
        </TabsContent>

        <TabsContent value="security">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionTab />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountsTab />
        </TabsContent>

        <TabsContent value="danger">
          <ProfileDangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
