import { GearIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { PROFILE_PAGE, SETTINGS_PAGE } from "@/app.constants.ts";
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
  const logout = () =>  signOut();

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
          <DropdownMenuItem
            className="gap-2 px-4 py-2.5 text-md"
            onClick={logout}
            variant="destructive"
          >
            <SignOutIcon className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
