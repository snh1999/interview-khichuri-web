import { format } from "date-fns";
import type { ReactNode } from "react";
import {
  coversWholeDay,
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT_PX,
  isAllDayEvent,
  spansMultipleDays,
  yToTime,
} from "../calendar.helpers";
import type { TCustomEvent, TJobEvent } from "../calendar.types";
import { AllDayRow } from "./AllDayRow";
import { DayColumn } from "./DayColumn";
import { SpanningBarsOverlay } from "./SpanningBarsOverlay";
import { buildDayChipLayouts, buildSpanningSegments } from "./timeGrid.layout";
import { useTimeGridDrag } from "./useTimeGridDrag";

const HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => i + DAY_START_HOUR
);

interface Props {
  days: Date[];
  events: (TJobEvent | TCustomEvent)[];
  header?: ReactNode;
  onSlotSelect: (start: Date, end: Date, allDay?: boolean) => void;
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
}

export const TimeGrid = ({
  days,
  events,
  header,
  onSlotSelect,
  onCustomEventClick,
}: Props) => {
  const {
    rowRef,
    drag,
    handleClickCapture,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useTimeGridDrag(days, onSlotSelect);

  const timedEvents = events.filter(
    (e): e is TCustomEvent => "startDate" in e && !isAllDayEvent(e)
  );
  const singleDayTimedEvents = timedEvents.filter((e) => !spansMultipleDays(e));
  const multiDayTimedEvents = timedEvents.filter((e) => spansMultipleDays(e));
  const spanningSegments = buildSpanningSegments(multiDayTimedEvents, days);
  // The all-day row lists job events plus every day an event fully covers —
  // so a "full first day, partial second day" event shows its full day up
  // top and only its partial day inside the time grid.
  const allDayRowEvents = events.filter(
    (e) => "date" in e || days.some((day) => coversWholeDay(e, day))
  );

  const hasStickyHeader = header !== undefined || allDayRowEvents.length > 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-md border">
      <div className="calendar-scrollbar max-h-[70vh] overflow-y-auto">
        {hasStickyHeader ? (
          <div className="sticky top-0 z-40 bg-card">
            {header}
            <AllDayRow
              allDayEvents={allDayRowEvents}
              days={days}
              events={events}
              onCustomEventClick={onCustomEventClick}
            />
          </div>
        ) : null}

        <div className="flex">
          <div className="w-16 shrink-0 border-r">
            {HOURS.map((h) => (
              <div
                className="flex items-start justify-end pr-2 text-muted-foreground text-xs"
                key={h}
                style={{ height: HOUR_HEIGHT_PX }}
              >
                {format(new Date(2000, 0, 1, h), "h a")}
              </div>
            ))}
          </div>

          <div
            className="relative flex flex-1"
            onClickCapture={handleClickCapture}
            onPointerCancel={handlePointerCancel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            ref={rowRef}
          >
            {drag && drag.startDayIndex !== drag.currentDayIndex && (
              <div className="pointer-events-none absolute inset-x-0 top-1 z-40 flex justify-center">
                <span className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs shadow">
                  {format(
                    days[Math.min(drag.startDayIndex, drag.currentDayIndex)],
                    "MMM d"
                  )}
                  {" – "}
                  {format(
                    days[Math.max(drag.startDayIndex, drag.currentDayIndex)],
                    "MMM d"
                  )}
                </span>
              </div>
            )}

            {days.map((day, i) => {
              const dayChips = buildDayChipLayouts(singleDayTimedEvents, day);
              const inMultiDayRange = Boolean(
                drag &&
                  drag.startDayIndex !== drag.currentDayIndex &&
                  i >= Math.min(drag.startDayIndex, drag.currentDayIndex) &&
                  i <= Math.max(drag.startDayIndex, drag.currentDayIndex)
              );
              const isSameDayDrag = Boolean(
                drag &&
                  drag.startDayIndex === drag.currentDayIndex &&
                  drag.startDayIndex === i
              );
              const previewStart =
                isSameDayDrag && drag
                  ? yToTime(Math.min(drag.startY, drag.currentY), day)
                  : null;
              const previewEnd =
                isSameDayDrag && drag
                  ? yToTime(Math.max(drag.startY, drag.currentY), day)
                  : null;

              return (
                <DayColumn
                  day={day}
                  dayChips={dayChips}
                  events={events}
                  inMultiDayRange={inMultiDayRange}
                  key={day.toISOString()}
                  onCustomEventClick={onCustomEventClick}
                  previewEnd={previewEnd}
                  previewStart={previewStart}
                />
              );
            })}

            <SpanningBarsOverlay
              days={days}
              events={events}
              onCustomEventClick={onCustomEventClick}
              segments={spanningSegments}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
