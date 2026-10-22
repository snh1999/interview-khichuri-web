import {
  ArrowLeftIcon,
  BuildingsIcon,
  ListMagnifyingGlassIcon,
  NotebookIcon,
  SquaresFourIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "react-router";
import {
  ADMIN_COMPANIES_PAGE,
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
] as const;

export const AdminSidebar = () => {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="pt-5 text-muted-foreground">
              {ADMIN_MENU.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    className="py-5 text-md"
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

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="text-muted-foreground">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-5 text-md"
                  render={<Link to={HOMEPAGE} />}
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
