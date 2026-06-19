import {
  DetectiveIcon,
  KeyIcon,
  LinkIcon,
  ShieldIcon,
  TrashIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { ProfileCard } from "@/components/common/ProfileCard.tsx";
import { AccountsTab } from "@/components/settings/account/LinkedAccounts.tsx";
import KeysSection from "@/components/settings/keys/KeysSection.tsx";
import { ProfileDangerZone } from "@/components/settings/ProfileDangerZone.tsx";
import { ProfileSecurityTab } from "@/components/settings/security/ProfileSecurity.tsx";
import { SessionTab } from "@/components/settings/session/SessionTab.tsx";
import { UpdateProfileForm } from "@/components/settings/update/UpdateProfileForm.tsx";
import { Card, CardHeader } from "@/components/ui/card.tsx";
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
    <div className="my-6 w-full px-4">
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
            <DetectiveIcon />
            <span className="max-sm:hidden">Keys</span>
          </TabsTrigger>
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

export default SettingsPage;
