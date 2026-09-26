import { GearIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { PROFILE_PAGE, SETTINGS_PAGE } from "@/app.constants.ts";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { ProfileCard } from "@/components/common/ProfileCard.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { signOut } from "@/lib/auth/auth-client.ts";
import { clearLocalCache } from "@/lib/indexdb.ts";

interface IProps {
  trigger: ReactElement;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
}

const ProfileDropdown = ({
  trigger,
  defaultOpen,
  align = "end",
}: Readonly<IProps>) => {
  const navigate = useNavigate();
  const navigateToProfile = () => navigate(PROFILE_PAGE);
  const navigateToSettings = () => navigate(SETTINGS_PAGE);
  const logout = async () => {
    await clearLocalCache();
    return signOut();
  };
  const logoutKeepData = async () => {
    const result = await signOut();
    if (result.error) {
      toast.error(result.error.message ?? "Something went wrong");
    }
    return result;
  };

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align={align || "end"} className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-4 px-4 py-2.5 font-normal">
            <ProfileCard isCompact />
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="*:gap-2 *:px-4 *:py-2.5 *:text-md">
          <DropdownMenuItem onClick={navigateToProfile}>
            <UserIcon className="size-4" />
            <span>My account</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={navigateToSettings}>
            <GearIcon className="size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <AuthActionButton
            action={logout}
            actionLabel="Log out & clear data"
            cancelLabel="Log out"
            dialogDescription={`"Logout & Clear data" wipes the local cache (ATS scores, recommendations, tailoring notes) before logging out. Use "Logout" to keep this browser's cached ATS data and just logs out.`}
            dialogTitle="Log out?"
            onCancel={logoutKeepData}
            renderNode={
              <DropdownMenuItem
                className="gap-2 px-4 py-2.5 text-md"
                closeOnClick={false}
                variant="destructive"
              >
                <SignOutIcon className="size-4" />
                Log out
              </DropdownMenuItem>
            }
            requireConfirmation
            successMessage="Logged out. Redirecting…"
            variant="destructive"
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
