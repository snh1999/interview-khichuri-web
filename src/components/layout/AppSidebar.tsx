import {
  BriefcaseIcon,
  BugIcon,
  BuildingsIcon,
  GearIcon,
  LightbulbFilamentIcon,
  NotebookIcon,
  PresentationChartIcon,
  ReadCvLogoIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "react-router";
import {
  COMPANIES_PAGE,
  HOMEPAGE,
  JOBS_PAGE,
  NOTES_PAGE,
  PROFILE_PAGE,
  RESUMES_PAGE,
  SESSIONS_PAGE,
  SETTINGS_PAGE,
} from "@/app.constants.ts";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";

const SIDEBAR_MENU = [
  { name: "Dashboard", icon: PresentationChartIcon, url: HOMEPAGE },
  { name: "Jobs", icon: BriefcaseIcon, url: JOBS_PAGE },
  { name: "Preparation", icon: LightbulbFilamentIcon, url: SESSIONS_PAGE },
  { name: "Companies", icon: BuildingsIcon, url: COMPANIES_PAGE },
  { name: "Notes", icon: NotebookIcon, url: NOTES_PAGE },
  { name: "Profile", icon: ReadCvLogoIcon, url: PROFILE_PAGE },
  {
    name: "Builders",
    icon: ReadCvLogoIcon,
    url: RESUMES_PAGE,
  },
  { name: "Settings", icon: GearIcon, url: SETTINGS_PAGE },
] as const;

export const AppSidebar = () => {
  const { pathname } = useLocation();
  return (
    <Sidebar className="top-12 h-auto" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="text-muted-foreground">
              {SIDEBAR_MENU.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    className="text-md py-5"
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
      <SidebarFooter>
        <SidebarMenu className="text-muted-foreground">
          <SidebarMenuItem>
            <FeedbackDialog
              trigger={
                <SidebarMenuButton className="text-md py-5">
                  <BugIcon />
                  <span>Report a bug</span>
                </SidebarMenuButton>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
