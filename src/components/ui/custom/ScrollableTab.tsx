import { cn } from "@/lib/utils.ts";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useTabs } from "@/hooks/useTabs.ts";

interface TScrollableTab<T extends string> {
  key: T;
  label: string;
  indicator?: ReactNode;
}

interface Props<T extends string> {
  tabs: TScrollableTab<T>[];
  defaultTab: T;
  scrollTracking?: boolean;
  scrollOffset?: number;
}

export const getTabSectionId = <T extends string>(key: T) => `section-${key}`;

const scrollToSection = <T extends string>(key: T, offset = 0) => {
  const element = document.getElementById(getTabSectionId(key));
  if (!element) return;

  // Using viewport.scrollTo instead of element.scrollIntoView because scrollIntoView
  // finds the nearest scrollable ancestor, which can be <body> when the ScrollArea
  // viewport's height doesn't resolve as a scroll container. Scrolling <body> moves
  // the page header (which lives outside the viewport) out of view.
  const viewport = element.closest<HTMLElement>(
    '[data-slot="scroll-area-viewport"]'
  );
  if (viewport) {
    const top =
      element.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top +
      viewport.scrollTop -
      offset;
    viewport.scrollTo({ top, behavior: "smooth" });
  }
};

export const ScrollableTabs = <T extends string>({
  tabs,
  defaultTab,
  scrollTracking = false,
  scrollOffset = 0,
}: Readonly<Props<T>>) => {
  const { currentTab, handleTabChange } = useTabs(defaultTab);
  const prevKey = useRef(defaultTab);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollTracking || !rootRef.current) return;

    // scope to own viewport, not first match in whole DOM (breaks if multiple
    // instances ever mount on same page)
    const viewport = rootRef.current.closest<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );

    if (!viewport) return;

    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const scrollTop = viewport.scrollTop;
        const atBottom =
          scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2;

        for (let i = tabs.length - 1; i >= 0; i--) {
          const el = document.getElementById(getTabSectionId(tabs[i].key));
          if (el && (el.offsetTop - scrollOffset <= scrollTop || atBottom)) {
            if (prevKey.current !== tabs[i].key) {
              prevKey.current = tabs[i].key;
              handleTabChange(tabs[i].key);
            }
            break;
          }
        }
      });
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [scrollTracking, scrollOffset, handleTabChange, tabs]);

  const handleClick = (key: T) => {
    scrollToSection(key, scrollOffset);
    handleTabChange(key);
  };

  return (
    <div
      ref={rootRef}
      className="border-border overflow-hidden bg-background sticky top-0 z-10 border-b"
    >
      <nav className="flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleClick(tab.key)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors",
              currentTab === tab.key
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
