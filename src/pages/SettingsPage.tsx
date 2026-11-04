import {
  KeyIcon,
  LinkIcon,
  MonitorIcon,
  ShieldIcon,
  TrashIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard.tsx";
import { ProfileCard } from "@/components/common/ProfileCard.tsx";
import KeysSection from "@/components/keys/KeysSection.tsx";
import { AccountsTab } from "@/components/settings/account/LinkedAccounts.tsx";
import { ProfileDangerZone } from "@/components/settings/ProfileDangerZone.tsx";
import { ProfileSecurityTab } from "@/components/settings/security/ProfileSecurity.tsx";
import { SessionTab } from "@/components/settings/session/SessionTab.tsx";
import { UpdateProfileForm } from "@/components/settings/update/UpdateProfileForm.tsx";
import { Card, CardHeader } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabs } from "@/hooks/useTabs.ts";
import { useSession } from "@/lib/auth/auth-client.ts";

const SettingsPage = () => {
  const { data: session } = useSession();

  const { currentTab, handleTabChange } = useTabs("profile");

  if (!session) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="w-full">
      <h1 className="mb-4 font-semibold text-xl sm:sr-only">Settings</h1>

      <Card className="mb-2 bg-background">
        <CardHeader className="flex items-center space-x-4">
          <ProfileCard />
        </CardHeader>
      </Card>

      <Tabs
        className="space-y-2"
        onValueChange={handleTabChange}
        value={currentTab}
      >
        <TabsList className="w-full" variant="line">
          <TabsTrigger value="keys">
            <KeyIcon />
            <span className="max-sm:sr-only">Keys</span>
          </TabsTrigger>
          <TabsTrigger value="profile">
            <UserIcon />
            <span className="max-sm:sr-only">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldIcon />
            <span className="max-sm:sr-only">Security</span>
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <MonitorIcon />
            <span className="max-sm:sr-only">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <LinkIcon />
            <span className="max-sm:sr-only">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="danger">
            <TrashIcon />
            <span className="max-sm:sr-only">Danger Zone</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <KeysSection />
        </TabsContent>

        <TabsContent value="profile">
          <UpdateProfileForm user={session.user} />
        </TabsContent>

        <TabsContent value="security">
          <ProfileSecurityTab />
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

const SettingsPageSkeleton = () => (
  <div className="w-full space-y-2">
    <SkeletonCard noFooter>
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </SkeletonCard>

    <Skeleton className="h-11 w-full sm:h-8 sm:w-96" />

    <SkeletonCard noFooter>
      <Skeleton className="h-40 w-full" />
    </SkeletonCard>
  </div>
);

export default SettingsPage;
