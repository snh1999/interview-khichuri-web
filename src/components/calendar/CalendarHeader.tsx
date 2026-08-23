import { CaretLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useScheduleStore } from "@/store/scheduleStore.ts";
import { getWeekDays, toAnchorDate } from "./calendar.helpers";
import type { TViewMode } from "./calendar.types";
import { EventFilters } from "./EventFilters";

export const CalendarHeader = () => {
  const anchor = useScheduleStore((s) => s.anchor);
  const viewMode = useScheduleStore((s) => s.viewMode);
  const visibility = useScheduleStore((s) => s.visibility);
  const goToNext = useScheduleStore((s) => s.goToNext);
  const goToPrev = useScheduleStore((s) => s.goToPrev);
  const goToToday = useScheduleStore((s) => s.goToToday);
  const setViewMode = useScheduleStore((s) => s.setViewMode);
  const toggleVisibility = useScheduleStore((s) => s.toggleVisibility);
  const openCreateDrawer = useScheduleStore((s) => s.openCreateDrawer);

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
      const weekDays = getWeekDays(date);
      return `${format(weekDays[0], "MMM d")} — ${format(
        weekDays[6],
        "MMM d, yyyy"
      )}`;
    }
    return format(date, "MMMM yyyy");
  };

  const handleAddEventClick = () => {
    const now = new Date(anchor.year, anchor.month, anchor.day);
    openCreateDrawer({ startDate: now, endDate: now, allDay: true });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button onClick={goToToday} size="sm" variant="outline">
          Today
        </Button>
        <Button onClick={goToPrev} size="icon" variant="outline">
          <CaretLeftIcon className="size-4" />
        </Button>
        <h2 className="font-semibold">{getTitle()}</h2>

        <Button onClick={goToNext} size="icon" variant="outline">
          <CaretRightIcon className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <ToggleGroup
          onValueChange={handleViewModeChange}
          size="sm"
          value={[viewMode]}
        >
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
        </ToggleGroup>

        <Button
          className="size-8"
          onClick={handleAddEventClick}
          size="icon"
          variant="outline"
        >
          <PlusIcon className="size-4" />
        </Button>

        <EventFilters onToggle={toggleVisibility} visibility={visibility} />
      </div>
    </div>
  );
};
