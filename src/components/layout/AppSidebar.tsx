import {
  BriefcaseIcon,
  CalendarDotsIcon,
  GearIcon,
  HouseIcon,
  LightbulbFilamentIcon,
  PresentationChartIcon,
  ReadCvLogoIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "react-router";
import { HOMEPAGE, PROFILE_PAGE, SETTINGS_PAGE } from "@/app.constants.ts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";

const SIDEBAR_MENU = [
  { name: "Dashboard", icon: PresentationChartIcon, url: HOMEPAGE },
  { name: "Schedule", icon: CalendarDotsIcon, url: "#" },
  { name: "Jobs", icon: BriefcaseIcon, url: "#" },
  { name: "Preparation", icon: LightbulbFilamentIcon, url: "#" },
  { name: "Job Profile", icon: ReadCvLogoIcon, url: PROFILE_PAGE },
  { name: "Settings", icon: GearIcon, url: SETTINGS_PAGE },
] as const;

export const AppSidebar = () => {
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="pt-5 text-foreground/80">
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/" />}>
                  <HouseIcon />
                  <span>Khichuri Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="text-muted-foreground">
              {SIDEBAR_MENU.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={<Link to={item.url} />}
                  >
                    <item.icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
