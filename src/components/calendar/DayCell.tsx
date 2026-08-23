import { format, isSameMonth, isToday } from "date-fns";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "./CalendarEvent";
import {
  MONTH_BAR_ROW_GAP_PX,
  MONTH_BAR_ROW_HEIGHT_PX,
  spansMultipleDays,
} from "./calendar.helpers";
import type { TCustomEvent, TJobEvent } from "./calendar.types";

const MAX_VISIBLE_EVENTS = 3;

interface Props {
  day: Date;
  currentMonth: Date;
  events: (TJobEvent | TCustomEvent)[];
  barLanes?: number;
  isInDragRange?: boolean;
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
  onPointerDown?: () => void;
  onPointerEnter?: () => void;
}

export const DayCell = ({
  day,
  currentMonth,
  events,
  barLanes = 0,
  isInDragRange,
  onCustomEventClick,
  onPointerDown,
  onPointerEnter,
}: Props) => {
  const dayIsToday = isToday(day);
  const isCurrent = isSameMonth(day, currentMonth);
  // Multi-day events are rendered as continuous week-row bars; cells only
  // chip single-day events.
  const chipEvents = events.filter((event) => !spansMultipleDays(event));
  const visibleEvents = chipEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenCount = chipEvents.length - MAX_VISIBLE_EVENTS;
  const stopPointerPropagation = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-20 flex-col gap-1 border-r border-b p-1.5 md:min-h-[6.5rem]",
        !isCurrent && "bg-muted/30 opacity-50",
        isInDragRange && "bg-primary/10"
      )}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
    >
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full font-medium text-xs",
          dayIsToday && "bg-primary font-semibold text-primary-foreground",
          !dayIsToday && "text-foreground"
        )}
      >
        {format(day, "d")}
      </span>

      <div
        className="flex flex-1 flex-col gap-1"
        style={{
          paddingTop:
            barLanes > 0
              ? barLanes * (MONTH_BAR_ROW_HEIGHT_PX + MONTH_BAR_ROW_GAP_PX)
              : undefined,
        }}
      >
        {visibleEvents.map((event) => (
          <CalendarEvent
            event={event}
            key={event.id}
            // biome-ignore lint/performance/noJsxPropsBind: <>
            onCustomClick={() => onCustomEventClick(events, day)}
          />
        ))}
        {hiddenCount > 0 && (
          <button
            className="w-full truncate rounded px-1 py-0.5 text-left text-muted-foreground text-xs hover:bg-muted"
            // biome-ignore lint/performance/noJsxPropsBind: <>
            onClick={() => onCustomEventClick(events, day)}
            onPointerDown={stopPointerPropagation}
            type="button"
          >
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  );
};
