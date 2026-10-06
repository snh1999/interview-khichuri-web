import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useTabs } from "@/hooks/useTabs.ts";

interface TScrollableTab<T extends string> {
  key: T;
  label: string;
  indicator?: ReactNode;
}

interface Props<T extends string> {
  tabs: TScrollableTab<T>[] | readonly TScrollableTab<T>[];
  defaultTab: T;
  scrollTracking?: boolean;
  scrollOffset?: number;
}

export const getTabSectionId = <T extends string>(key: T) => `section-${key}`;

// scrollToSection and the tracking effect must both measure from the viewport: offsetTop is relative to the nearest positioned ancestor, so the two once resolved different sections as active.
const getViewport = (root: HTMLElement | null) =>
  root?.closest<HTMLElement>('[data-slot="scroll-area-viewport"]') ?? null;

const getSection = (viewport: HTMLElement, key: string) =>
  viewport.querySelector<HTMLElement>(`#${CSS.escape(getTabSectionId(key))}`);

const scrollToSection = <T extends string>(
  key: T,
  offset: number,
  root: HTMLElement | null
) => {
  // Not scrollIntoView: it picks the nearest scrollable ancestor, which can be <body> when the ScrollArea viewport's height doesn't resolve as a scroll container.
  // Scrolling <body> moves the page header, which lives outside the viewport, out of view.
  const viewport = getViewport(root);
  const element = viewport && getSection(viewport, key);
  if (!viewport || !element) return false;

  // Clamped explicitly rather than letting the browser do it: an unreachable target scrolls nothing, and no scrollend would fire to release the tracking lock this click takes.
  const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const top = Math.min(
    Math.max(
      element.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top +
        viewport.scrollTop -
        offset,
      0
    ),
    maxScroll
  );

  // Already there, so no scroll happens and nothing would release the lock.
  if (Math.abs(top - viewport.scrollTop) <= 2) return false;

  viewport.scrollTo({ top, behavior: "smooth" });
  return true;
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
  const navRef = useRef<HTMLElement | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const isClickScrolling = useRef(false);

  // useTabs returns a new handleTabChange on every render, so the ref keeps the tracking effect from tearing down and re-adding its scroll listeners each time.
  const handleTabChangeRef = useRef(handleTabChange);
  useEffect(() => {
    handleTabChangeRef.current = handleTabChange;
  });

  useEffect(() => {
    if (!scrollTracking || !rootRef.current) return;

    // Our own viewport, so two instances can't read each other's sections.
    const viewport = getViewport(rootRef.current);
    if (!viewport) return;

    let rafId: number | null = null;

    // A click's smooth scroll would otherwise walk the active tab through every section it passes, so hold tracking off until scrollend.
    const onScrollEnd = () => {
      isClickScrolling.current = false;
    };

    const onScroll = () => {
      if (isClickScrolling.current) return;

      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        // A frame queued just before a click still runs, and would write the intermediate section the viewport was at; nothing restores the clicked tab afterwards.
        if (isClickScrolling.current) return;

        const scrollTop = viewport.scrollTop;
        const atBottom =
          scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2;

        const viewportTop = viewport.getBoundingClientRect().top;

        for (let i = tabs.length - 1; i >= 0; i--) {
          const el = getSection(viewport, tabs[i].key);
          if (!el) continue;
          const elTop = el.getBoundingClientRect().top;
          // 1px tolerance, matching the edge state: without it a 1px backward scroll moves the section's top to +1 and drops the highlight to the previous tab.
          if (elTop - viewportTop - scrollOffset <= 1 || atBottom) {
            if (prevKey.current !== tabs[i].key) {
              prevKey.current = tabs[i].key;
              handleTabChangeRef.current(tabs[i].key);
            }
            break;
          }
        }
      });
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("scrollend", onScrollEnd, { passive: true });

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("scrollend", onScrollEnd);
      if (rafId !== null) cancelAnimationFrame(rafId);
      // No listener survives cleanup, so a held lock would never be released.
      isClickScrolling.current = false;
    };
  }, [scrollTracking, scrollOffset, tabs]);

  useEffect(() => {
    const nav = navRef.current;
    const button = nav?.querySelector<HTMLElement>(
      `[data-tab="${CSS.escape(currentTab)}"]`
    );
    if (!nav || !button) return;
    const left = button.offsetLeft - (nav.clientWidth - button.offsetWidth) / 2;
    nav.scrollTo({ left, behavior: "smooth" });
  }, [currentTab]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const update = () => {
      const max = nav.scrollWidth - nav.clientWidth;
      setEdges((prev) => {
        const next = {
          left: nav.scrollLeft > 1,
          right: nav.scrollLeft < max - 1,
        };
        return prev.left === next.left && prev.right === next.right ? prev : next;
      });
    };

    update();
    void document.fonts.ready.then(update);
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    for (const child of nav.children) observer.observe(child);
    nav.addEventListener("scroll", update, { passive: true });

    return () => {
      observer.disconnect();
      nav.removeEventListener("scroll", update);
    };
  }, [tabs]);

  const scrollNav = (direction: 1 | -1) => {
    const nav = navRef.current;
    if (nav) {
      nav.scrollBy({ left: direction * nav.clientWidth * 0.8, behavior: "smooth" });
    }
  };

  const handleClick = (key: T) => {
    // The click is authoritative, so prevKey follows it here: tracking is held off for the scroll and would otherwise skip its own URL write later, leaving the wrong tab highlighted.
    prevKey.current = key;
    handleTabChange(key);
    // Unconditional: it does the scrolling, so it must not sit behind &&.
    const moved = scrollToSection(key, scrollOffset, rootRef.current);
    // Only take the lock when something can release it: with tracking off no scrollend listener is attached, so a lock would never clear and would kill tracking if the prop were later switched on.
    isClickScrolling.current = scrollTracking && moved;
  };

  return (
    <div
      ref={rootRef}
      className="border-border overflow-hidden bg-background flex items-center sticky top-0 z-10 border-b"
    >
      <Button
        aria-label="Scroll tabs left"
        className={cn("rounded-full opacity-50 hover:opacity-100", !edges.left && "hidden")}
        disabled={!edges.left}
        onClick={() => scrollNav(-1)}
        size="icon"
        variant="secondary"
      >
        <CaretLeftIcon />
      </Button>
      <nav
        ref={navRef}
        className="no-scrollbar relative flex min-w-0 flex-1 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            data-tab={tab.key}
            onClick={() => handleClick(tab.key)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors",
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
      <Button
        aria-label="Scroll tabs right"
        className={cn("rounded-full opacity-50 hover:opacity-100", !edges.right && "hidden")}
        disabled={!edges.right}
        onClick={() => scrollNav(1)}
        size="icon"
        variant="secondary"
      >
        <CaretRightIcon />
      </Button>
    </div>
  );
};
