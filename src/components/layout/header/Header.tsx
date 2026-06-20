import { HeaderBreadcrumb } from "@/components/layout/header/HeaderBreadcrumb.tsx";
import ProfileMenu from "@/components/layout/header/ProfileMenu.tsx";
import { ThemePicker } from "@/components/theme/ThemePicker.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { SidebarTrigger } from "@/components/ui/sidebar.tsx";

export const Header = () => (
  <header className="top-0 z-50 mx-auto flex h-12 w-full items-center justify-between gap-6 border-b bg-card px-4 py-2 sm:px-6">
    <div className="flex items-center gap-4">
      <SidebarTrigger className="[&_svg]:size-5!" />
      <Separator
        className="hidden h-4! data-vertical:self-center sm:block"
        orientation="vertical"
      />
      <HeaderBreadcrumb />
    </div>
    <div className="flex items-center gap-1.5">
      <ThemePicker />
      <ProfileMenu
        trigger={
          <Button size="icon" variant="ghost">
            <Avatar className="size-[inherit] rounded-[inherit] after:rounded-[inherit]">
              <AvatarImage
                className="rounded-[inherit]"
                src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
              />
              <AvatarFallback className="rounded-[inherit]">JD</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
    </div>
  </header>
);
