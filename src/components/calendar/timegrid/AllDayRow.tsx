import { CalendarEvent } from "../CalendarEvent";
import { eventCoversDay, getEventsForDay } from "../calendar.helpers";
import type { TCustomEvent, TJobEvent } from "../calendar.types";

interface Props {
  days: Date[];
  events: (TJobEvent | TCustomEvent)[];
  allDayEvents: (TJobEvent | TCustomEvent)[];
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
}

export const AllDayRow = ({
  days,
  events,
  allDayEvents,
  onCustomEventClick,
}: Props) => {
  if (allDayEvents.length === 0) {
    return null;
  }

  return (
    <div
      className="grid border-b"
      style={{ gridTemplateColumns: `4rem repeat(${days.length}, 1fr)` }}
    >
      <div className="border-r p-1 text-muted-foreground text-xs">All day</div>
      {days.map((day) => (
        <div
          className="flex min-w-0 flex-col gap-0.5 border-r p-1 last:border-r-0"
          key={day.toISOString()}
        >
          {allDayEvents
            .filter((e) => eventCoversDay(e, day))
            .map((e) => (
              <CalendarEvent
                event={e}
                key={e.id}
                // biome-ignore lint/performance/noJsxPropsBind: <>
                onCustomClick={() =>
                  onCustomEventClick(getEventsForDay(events, day), day)
                }
              />
            ))}
        </div>
      ))}
    </div>
  );
};
