import { GearIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
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
  const logout = async () => {
    const result = await signOut();
    if (result.error) {
      toast.error(result.error.message ?? "Something went wrong");
    } else {
      toast.success("Logged out, Redirecting");
    }
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

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-2 px-4 py-2.5 text-base"
            onClick={navigateToProfile}
          >
            <UserIcon className="size-5 text-foreground" />
            <span>My account</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 px-4 py-2.5 text-base"
            onClick={navigateToSettings}
          >
            <GearIcon className="size-5 text-foreground" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-2 px-4 py-2.5 text-base"
            onClick={logout}
            variant="destructive"
          >
            <SignOutIcon className="size-5" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
