import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  getEventColors,
  getEventsForDay,
  HOUR_HEIGHT_PX,
  timeToY,
} from "../calendar.helpers";
import type { TCustomEvent, TJobEvent } from "../calendar.types";
import type { DayChipLayout } from "./timeGrid.layout";

const HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => i + DAY_START_HOUR
);

interface Props {
  day: Date;
  dayChips: DayChipLayout[];
  events: (TJobEvent | TCustomEvent)[];
  inMultiDayRange: boolean;
  previewStart: Date | null;
  previewEnd: Date | null;
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
}

export const DayColumn = ({
  day,
  dayChips,
  events,
  inMultiDayRange,
  previewStart,
  previewEnd,
  onCustomEventClick,
}: Props) => (
  <div
    className={cn(
      "relative flex-1 border-r last:border-r-0",
      inMultiDayRange && "bg-primary/10"
    )}
    style={{ height: HOUR_HEIGHT_PX * HOURS.length }}
  >
    {HOURS.map((h) => (
      <div className="border-b" key={h} style={{ height: HOUR_HEIGHT_PX }} />
    ))}

    {isToday(day) && (
      <div
        className="pointer-events-none absolute right-0 left-0 z-10 h-px bg-destructive"
        style={{ top: timeToY(new Date()) }}
      />
    )}

    {dayChips.map(({ event, leftPct, widthPct }) => (
      <DayChip
        day={day}
        event={event}
        events={events}
        key={event.id}
        leftPct={leftPct}
        onCustomEventClick={onCustomEventClick}
        widthPct={widthPct}
      />
    ))}

    {previewStart && previewEnd ? (
      <>
        <div
          className="pointer-events-none absolute right-1 left-1 z-30 rounded border-2 border-primary bg-primary/20"
          style={{
            top: timeToY(previewStart),
            height: Math.max(4, timeToY(previewEnd) - timeToY(previewStart)),
          }}
        />
        <div
          className="pointer-events-none absolute left-1 z-40 rounded bg-primary px-1.5 py-0.5 text-primary-foreground text-xs shadow"
          style={{ top: timeToY(previewStart) - 20 }}
        >
          {format(previewStart, "h:mm a")}
        </div>
        <div
          className="pointer-events-none absolute left-1 z-40 rounded bg-primary px-1.5 py-0.5 text-primary-foreground text-xs shadow"
          style={{ top: timeToY(previewEnd) + 2 }}
        >
          {format(previewEnd, "h:mm a")}
        </div>
      </>
    ) : null}
  </div>
);

interface ChipProps {
  event: TCustomEvent;
  day: Date;
  events: (TJobEvent | TCustomEvent)[];
  leftPct: number;
  widthPct: number;
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
}

const DayChip = ({
  event,
  day,
  events,
  leftPct,
  widthPct,
  onCustomEventClick,
}: ChipProps) => {
  const colors = getEventColors(event);
  const companySuffix = "companyName" in event ? ` — ${event.companyName}` : "";

  const handleClick = () =>
    onCustomEventClick(getEventsForDay(events, day), day);

  return (
    <button
      className={cn(
        "absolute z-20 overflow-hidden truncate whitespace-nowrap rounded-md px-1 text-center font-medium text-xs leading-tight shadow-sm transition-opacity hover:opacity-80",
        colors.bg,
        colors.text
      )}
      data-calendar-event
      onClick={handleClick}
      style={{
        top: timeToY(event.startDate),
        height: Math.max(16, timeToY(event.endDate) - timeToY(event.startDate)),
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
      title={`${event.title}${companySuffix} (${format(event.startDate, "MMM d h:mm a")} – ${format(event.endDate, "MMM d h:mm a")})`}
      type="button"
    >
      {event.title}
    </button>
  );
};
