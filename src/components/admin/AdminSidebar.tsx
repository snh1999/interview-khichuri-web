import {
  ArrowLeftIcon,
  BuildingsIcon,
  ChatCircleTextIcon,
  ListMagnifyingGlassIcon,
  NotebookIcon,
  SquaresFourIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "react-router";
import {
  ADMIN_COMPANIES_PAGE,
  ADMIN_FEEDBACK_PAGE,
  ADMIN_LOOKUPS_PAGE,
  ADMIN_PAGE,
  ADMIN_PROMPTS_PAGE,
  ADMIN_USERS_PAGE,
  HOMEPAGE,
} from "@/app.constants.ts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";

const ADMIN_MENU = [
  { name: "Overview", icon: SquaresFourIcon, url: ADMIN_PAGE },
  { name: "Users", icon: UsersIcon, url: ADMIN_USERS_PAGE },
  { name: "Lookups", icon: ListMagnifyingGlassIcon, url: ADMIN_LOOKUPS_PAGE },
  { name: "Prompts", icon: NotebookIcon, url: ADMIN_PROMPTS_PAGE },
  { name: "Companies", icon: BuildingsIcon, url: ADMIN_COMPANIES_PAGE },
  { name: "Feedback", icon: ChatCircleTextIcon, url: ADMIN_FEEDBACK_PAGE },
] as const;

const isActivePath = (pathname: string, url: string) =>
  url === ADMIN_PAGE ? pathname === url : pathname.startsWith(url);

export const AdminSidebar = () => {
  const { pathname } = useLocation();

  return (
    <Sidebar className="top-12 h-auto" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="text-muted-foreground pt-5">
              {ADMIN_MENU.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    className="text-md py-5"
                    isActive={isActivePath(pathname, item.url)}
                    render={<Link to={item.url} />}
                    tooltip={item.name}
                  >
                    <item.icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="text-muted-foreground">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-md py-5"
                  render={<Link to={HOMEPAGE} />}
                  tooltip="Back to app"
                >
                  <ArrowLeftIcon />
                  <span>Back to app</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
