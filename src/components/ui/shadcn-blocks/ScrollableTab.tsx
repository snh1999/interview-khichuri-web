import { cn } from "@/lib/utils.ts";
import type { ReactNode } from "react";

type TScrollableTab = {
  key: string;
  label: string;
  indicator?: ReactNode;
};

type Props = {
  tabs: TScrollableTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  getSectionId?: (key: string) => string;
};

export const ScrollableTabs = ({
  tabs,
  activeTab,
  onTabChange,
  getSectionId,
}: Props) => {
  const handleClick = (key: string) => {
    if (getSectionId) {
      const el = document.getElementById(getSectionId(key));
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    onTabChange(key);
  };

  return (
    <div className="border-border bg-background sticky top-0 z-10 border-b">
      <nav className="flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleClick(tab.key)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.key
                ? "text-foreground after:bg-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:opacity-100"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.indicator}
          </button>
        ))}
      </nav>
    </div>
  );
};
