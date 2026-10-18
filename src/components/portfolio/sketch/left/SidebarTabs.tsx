import { LayoutIcon, SparkleIcon, StackIcon } from "@phosphor-icons/react";
import type React from "react";

export type SidebarTab = "pages" | "templates" | "library";

interface SidebarTabsProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const handlePagesTab = () => onTabChange("pages");
  const handleTemplatesTab = () => onTabChange("templates");
  const handleLibraryTab = () => onTabChange("library");
  return (
    <div className="flex gap-1 border-border border-b bg-muted/20 p-1.5">
      <button
        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold text-xs transition-all ${
          activeTab === "pages"
            ? "bg-background font-bold text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={handlePagesTab}
        type="button"
      >
        <StackIcon
          size={13}
          weight={activeTab === "pages" ? "bold" : "regular"}
        />
        <span>Layers</span>
      </button>

      <button
        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold text-xs transition-all ${
          activeTab === "templates"
            ? "bg-background font-bold text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={handleTemplatesTab}
        type="button"
      >
        <LayoutIcon
          size={13}
          weight={activeTab === "templates" ? "bold" : "regular"}
        />
        <span>Templates</span>
      </button>

      <button
        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold text-xs transition-all ${
          activeTab === "library"
            ? "bg-background font-bold text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={handleLibraryTab}
        type="button"
      >
        <SparkleIcon
          size={13}
          weight={activeTab === "library" ? "bold" : "regular"}
        />
        <span>Library</span>
      </button>
    </div>
  );
};
