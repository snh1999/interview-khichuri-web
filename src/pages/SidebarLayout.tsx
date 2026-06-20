import { Outlet } from "react-router";
import { AppSidebar } from "@/components/layout/AppSidebar.tsx";
import { Footer } from "@/components/layout/Footer.tsx";
import { Header } from "@/components/layout/header/Header.tsx";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area.tsx";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";

export const SidebarLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h flex h-dvh w-full flex-col overflow-hidden">
        <Header />

        {/* h-full important for right-scrollbar, min-h-0 important for horizontal sidebar*/}
        <ScrollArea className="h-full min-h-0 w-full flex-1 whitespace-nowrap rounded-md border">
          {/* min-h-full ensuring footer is at the bottom */}
          <div className="flex min-h-full">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              <main className="mx-auto w-full flex-1 px-4 py-6 sm:px-6">
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
