import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getEventColors, getEventsForDay } from "../calendar.helpers";
import type { TCustomEvent, TJobEvent } from "../calendar.types";
import type { SpanningSegmentLayout } from "./timeGrid.layout";

interface Props {
  segments: SpanningSegmentLayout[];
  days: Date[];
  events: (TJobEvent | TCustomEvent)[];
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
}

export const SpanningBarsOverlay = ({
  segments,
  days,
  events,
  onCustomEventClick,
}: Props) => {
  if (segments.length === 0) {
    return null;
  }
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {segments.map((seg) => {
        const colors = getEventColors(seg.event);
        const companySuffix =
          "companyName" in seg.event ? ` — ${seg.event.companyName}` : "";
        const barDay = days[seg.dayIdx];
        const handleClick = () =>
          onCustomEventClick(getEventsForDay(events, barDay), barDay);
        const prefix = seg.isFirst && seg.startsBeforeView ? "↳ " : "";
        const suffix = seg.isLast && seg.endsAfterView ? " ↝" : "";

        return (
          <button
            className={cn(
              "pointer-events-auto absolute overflow-hidden truncate whitespace-nowrap rounded-md px-1 text-center font-medium text-xs leading-tight shadow-sm transition-opacity hover:opacity-80",
              colors.bg,
              colors.text
            )}
            data-calendar-event
            key={`${seg.event.id}-${seg.dayIdx}`}
            onClick={handleClick}
            style={{
              top: seg.topPx,
              height: seg.heightPx,
              left: `${seg.leftPct}%`,
              width: `${seg.widthPct}%`,
            }}
            title={`${seg.event.title}${companySuffix} (${format(seg.event.startDate, "MMM d h:mm a")} – ${format(seg.event.endDate, "MMM d h:mm a")})`}
            type="button"
          >
            {prefix}
            {seg.event.title}
            {suffix}
          </button>
        );
      })}
    </div>
  );
};
