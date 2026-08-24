import { useCallback, useEffect, useMemo, useState } from "react";
import { useScheduleStore } from "@/store/scheduleStore.ts";
import { CalendarEvent } from "./CalendarEvent";
import {
  getEventsForDay,
  getMonthGrid,
  getMonthWeekBars,
  MONTH_BAR_AREA_TOP_PX,
  MONTH_BAR_ROW_GAP_PX,
  MONTH_BAR_ROW_HEIGHT_PX,
} from "./calendar.helpers";
import type { TCustomEvent, TJobEvent } from "./calendar.types";
import { DayCell } from "./DayCell";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  events: (TJobEvent | TCustomEvent)[];
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
  onDateRangeSelect: (start: Date, end: Date) => void;
}

export const MonthGrid = ({
  events,
  onCustomEventClick,
  onDateRangeSelect,
}: Props) => {
  const anchor = useScheduleStore((s) => s.anchor);
  const days = useMemo(
    () => getMonthGrid(anchor.year, anchor.month),
    [anchor.year, anchor.month]
  );
  const currentMonth = new Date(anchor.year, anchor.month);

  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleCellPointerDown = useCallback((index: number) => {
    setDragStartIndex(index);
    setHoverIndex(index);
  }, []);

  const handleCellPointerEnter = useCallback(
    (index: number) => {
      if (dragStartIndex !== null) {
        setHoverIndex(index);
      }
    },
    [dragStartIndex]
  );

  useEffect(() => {
    if (dragStartIndex === null) {
      return;
    }

    const handleUp = () => {
      if (hoverIndex !== null) {
        const lo = Math.min(dragStartIndex, hoverIndex);
        const hi = Math.max(dragStartIndex, hoverIndex);
        const start = new Date(days[lo]);
        start.setHours(0, 0, 0, 0);
        const end = new Date(days[hi]);
        end.setHours(23, 59, 59, 999);
        onDateRangeSelect(start, end);
      }
      setDragStartIndex(null);
      setHoverIndex(null);
    };

    window.addEventListener("pointerup", handleUp);
    return () => window.removeEventListener("pointerup", handleUp);
  }, [dragStartIndex, hoverIndex, days, onDateRangeSelect]);

  const rangeLo =
    dragStartIndex !== null && hoverIndex !== null
      ? Math.min(dragStartIndex, hoverIndex)
      : null;
  const rangeHi =
    dragStartIndex !== null && hoverIndex !== null
      ? Math.max(dragStartIndex, hoverIndex)
      : null;

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div
            className="py-2 text-center font-medium text-muted-foreground text-xs"
            key={day}
          >
            {day}
          </div>
        ))}
      </div>
      <div>
        {weeks.map((weekDays, weekIndex) => {
          const bars = getMonthWeekBars(events, weekDays);
          const laneCount = bars.reduce(
            (max, bar) => Math.max(max, bar.lane + 1),
            0
          );

          return (
            <div className="relative" key={weekDays[0].toISOString()}>
              <div className="grid grid-cols-7">
                {weekDays.map((day, i) => {
                  const index = weekIndex * 7 + i;
                  return (
                    <DayCell
                      barLanes={laneCount}
                      currentMonth={currentMonth}
                      day={day}
                      events={getEventsForDay(events, day)}
                      isInDragRange={
                        rangeLo !== null &&
                        index >= rangeLo &&
                        index <= (rangeHi as number)
                      }
                      key={day.toISOString()}
                      onCustomEventClick={onCustomEventClick}
                      // biome-ignore lint/performance/noJsxPropsBind: <>
                      onPointerDown={() => handleCellPointerDown(index)}
                      // biome-ignore lint/performance/noJsxPropsBind: <>
                      onPointerEnter={() => handleCellPointerEnter(index)}
                    />
                  );
                })}
              </div>

              {bars.length > 0 ? (
                <div
                  className="pointer-events-none absolute inset-x-0"
                  style={{ top: MONTH_BAR_AREA_TOP_PX }}
                >
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gridTemplateRows: `repeat(${laneCount}, ${MONTH_BAR_ROW_HEIGHT_PX}px)`,
                      rowGap: MONTH_BAR_ROW_GAP_PX,
                    }}
                  >
                    {bars.map((bar) => (
                      <div
                        className="pointer-events-auto px-0.5"
                        key={bar.event.id}
                        style={{
                          gridColumn: `${bar.startCol + 1} / ${bar.endCol + 2}`,
                          gridRow: String(bar.lane + 1),
                        }}
                      >
                        <CalendarEvent
                          event={bar.event}
                          // biome-ignore lint/performance/noJsxPropsBind: <>
                          onCustomClick={() => {
                            const day = weekDays[bar.startCol];
                            onCustomEventClick(
                              getEventsForDay(events, day),
                              day
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
