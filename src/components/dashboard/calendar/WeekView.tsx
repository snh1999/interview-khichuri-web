import { format } from "date-fns";
import { useCalendarStore } from "@/store/calendarStore.ts";
import { getWeekDays, toAnchorDate } from "./calendar.helpers.ts";
import type { TCustomEvent, TJobEvent } from "./calendar.types.ts";
import { TimeGrid } from "./timegrid/TimeGrid.tsx";

interface Props {
  events: (TJobEvent | TCustomEvent)[];
  weekStartsOn?: 0 | 1;
  onSlotSelect: (start: Date, end: Date, allDay?: boolean) => void;
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
}

export const WeekView = ({
  events,
  weekStartsOn = 0,
  onSlotSelect,
  onCustomEventClick,
}: Props) => {
  const anchor = useCalendarStore((s) => s.anchor);
  const days = getWeekDays(
    toAnchorDate(anchor.year, anchor.month, anchor.day),
    weekStartsOn
  );

  return (
    <div>
      <TimeGrid
        days={days}
        events={events}
        header={
          <div
            className="grid"
            style={{ gridTemplateColumns: "4rem repeat(7, 1fr)" }}
          >
            <div />
            {days.map((d) => (
              <div className="border-b py-2 text-center" key={d.toISOString()}>
                <div className="text-muted-foreground text-xs">
                  {format(d, "EEE")}
                </div>
                <div className="font-medium text-sm">{format(d, "d")}</div>
              </div>
            ))}
          </div>
        }
        onCustomEventClick={onCustomEventClick}
        onSlotSelect={onSlotSelect}
      />
    </div>
  );
};
