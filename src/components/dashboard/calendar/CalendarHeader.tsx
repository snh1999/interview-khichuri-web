import { CaretLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { addMinutes, format } from "date-fns";
import { Button } from "@/components/ui/button.tsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";
import { useCalendarStore } from "@/store/calendarStore.ts";
import {
  DEFAULT_CLICK_DURATION_MINUTES,
  getWeekBoundary,
  toAnchorDate,
} from "./calendar.helpers.ts";
import type { TViewMode } from "./calendar.types.ts";
import { EventFilters } from "./EventFilters.tsx";

export const CalendarHeader = () => {
  const anchor = useCalendarStore((s) => s.anchor);
  const viewMode = useCalendarStore((s) => s.viewMode);
  const visibility = useCalendarStore((s) => s.visibility);
  const goToNext = useCalendarStore((s) => s.goToNext);
  const goToPrev = useCalendarStore((s) => s.goToPrev);
  const goToToday = useCalendarStore((s) => s.goToToday);
  const setViewMode = useCalendarStore((s) => s.setViewMode);
  const toggleVisibility = useCalendarStore((s) => s.toggleVisibility);
  const openCreateDrawer = useCalendarStore((s) => s.openCreateDrawer);

  const date = toAnchorDate(anchor.year, anchor.month, anchor.day);

  const handleViewModeChange = (value: (string | number)[]) => {
    const latest = value.at(-1);
    if (latest) {
      setViewMode(latest as TViewMode);
    }
  };

  const getTitle = () => {
    if (viewMode === "day") {
      return format(date, "MMMM d, yyyy");
    }
    if (viewMode === "week") {
      const { start, end } = getWeekBoundary(date);
      return start.getFullYear() === end.getFullYear()
        ? `${format(start, "MMM d")} — ${format(end, "MMM d, yyyy")}`
        : `${format(start, "MMM d, yyyy")} — ${format(end, "MMM d, yyyy")}`;
    }
    return format(date, "MMMM yyyy");
  };

  const handleAddEventClick = () => {
    const current = new Date();
    const start = new Date(
      anchor.year,
      anchor.month,
      anchor.day,
      current.getHours(),
      current.getMinutes()
    );
    openCreateDrawer({
      startDate: start,
      endDate: addMinutes(start, DEFAULT_CLICK_DURATION_MINUTES),
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button onClick={goToToday} variant="outline">
          Today
        </Button>
        <Button
          aria-label="Previous period"
          onClick={goToPrev}
          size="icon"
          variant="outline"
        >
          <CaretLeftIcon className="size-4" />
        </Button>
        <h2 className="font-semibold">{getTitle()}</h2>

        <Button
          aria-label="Next period"
          onClick={goToNext}
          size="icon"
          variant="outline"
        >
          <CaretRightIcon className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <ToggleGroup
          className="mr-2"
          onValueChange={handleViewModeChange}
          value={[viewMode]}
        >
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
        </ToggleGroup>

        <Button onClick={handleAddEventClick} variant="outline">
          <PlusIcon />
          Add event
        </Button>

        <EventFilters onToggle={toggleVisibility} visibility={visibility} />
      </div>
    </div>
  );
};
