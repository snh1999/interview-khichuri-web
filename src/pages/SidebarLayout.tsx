import { ArrowLeftIcon, HouseIcon } from "@phosphor-icons/react";
import { useCallback } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { HOMEPAGE } from "@/app.constants.ts";
import { AppSidebar } from "@/components/layout/AppSidebar.tsx";
import { Footer } from "@/components/layout/Footer.tsx";
import { Header } from "@/components/layout/header/Header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area.tsx";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";

const SidebarlessHeader = () => {
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <header className="top-0 z-50 mx-auto flex h-12 w-full items-center gap-1 border-b bg-card px-4 py-2 sm:px-6">
      <Button
        aria-label="Go back"
        onClick={goBack}
        size="icon-sm"
        variant="ghost"
      >
        <ArrowLeftIcon />
      </Button>
      <Button
        aria-label="Go home"
        nativeButton={false}
        render={<Link to={HOMEPAGE} />}
        size="icon-sm"
        variant="ghost"
      >
        <HouseIcon />
      </Button>
    </header>
  );
};

export const SidebarLayout = ({
  hideSidebar = false,
}: {
  hideSidebar?: boolean;
}) => {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full flex-col overflow-hidden">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
          href="#main-content"
        >
          Skip to content
        </a>
        {hideSidebar ? <SidebarlessHeader /> : <Header />}

        {/* h-full important for right-scrollbar, min-h-0 important for horizontal sidebar*/}
        <ScrollArea className="h-full min-h-0 w-full flex-1 rounded-md border">
          {/* min-h-full ensuring footer is at the bottom */}
          <div className="flex min-h-full">
            {hideSidebar ? null : <AppSidebar />}
            <div className="flex min-w-0 flex-1 flex-col">
              <main
                className="mx-auto flex w-full flex-1 flex-col px-4 py-6 sm:px-6"
                id="main-content"
              >
                <Outlet />
              </main>

              <Footer />
            </div>
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </SidebarProvider>
  );
};
