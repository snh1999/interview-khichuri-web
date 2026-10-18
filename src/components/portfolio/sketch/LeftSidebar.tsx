import type React from "react";
import { useCallback, useState } from "react";
import { LibraryTab } from "./left/LibraryTab";
import { PagesTab } from "./left/PagesTab";
import { type SidebarTab, SidebarTabs } from "./left/SidebarTabs";
import { TemplatesTab } from "./left/TemplatesTab";

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("pages");
  const goToPages = useCallback(() => setActiveTab("pages"), []);

  return (
    <aside className="z-20 flex h-full w-68 shrink-0 select-none flex-col border-border border-r bg-card sm:w-76">
      <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "pages" && <PagesTab />}

      {activeTab === "templates" && (
        <TemplatesTab onSwitchToPages={goToPages} />
      )}

      {activeTab === "library" && <LibraryTab />}
    </aside>
  );
};
