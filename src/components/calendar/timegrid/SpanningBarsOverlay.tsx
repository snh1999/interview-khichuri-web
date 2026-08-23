import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getEventsForDay } from "../calendar.helpers";
import type { TCustomEvent, TJobEvent } from "../calendar.types";
import { EVENT_COLORS } from "../calendar.types";
import type { SpanningBarLayout } from "./timeGrid.layout";

interface Props {
  bars: SpanningBarLayout[];
  days: Date[];
  events: (TJobEvent | TCustomEvent)[];
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
  stopPropagation: (e: React.PointerEvent<HTMLButtonElement>) => void;
}

export const SpanningBarsOverlay = ({
  bars,
  days,
  events,
  onCustomEventClick,
  stopPropagation,
}: Props) => {
  if (bars.length === 0) {
    return null;
  }
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {bars.map((bar) => {
        const colors = EVENT_COLORS[bar.event.source];
        const companySuffix =
          "companyName" in bar.event ? ` — ${bar.event.companyName}` : "";
        const spanPct = ((bar.endIdx - bar.startIdx + 1) / days.length) * 100;
        const slicePct = spanPct / bar.laneCount;
        const leftPct =
          (bar.startIdx / days.length) * 100 + slicePct * bar.lane;
        const barDay = days[bar.startIdx];
        const handleClick = () =>
          onCustomEventClick(getEventsForDay(events, barDay), barDay);

        return (
          <button
            className={cn(
              "pointer-events-auto absolute overflow-hidden truncate whitespace-nowrap rounded-md px-1 text-center font-medium text-xs leading-tight shadow-sm transition-opacity hover:opacity-80",
              colors.bg,
              colors.text
            )}
            key={bar.event.id}
            onClick={handleClick}
            onPointerDown={stopPropagation}
            style={{
              top: bar.topPx,
              height: bar.heightPx,
              left: `${leftPct}%`,
              width: `${slicePct}%`,
            }}
            title={`${bar.event.title}${companySuffix} (${format(bar.event.startDate, "MMM d h:mm a")} – ${format(bar.event.endDate, "MMM d h:mm a")})`}
            type="button"
          >
            {bar.startsBeforeView ? "↳ " : ""}
            {bar.event.title}
            {bar.endsAfterView ? " ↝" : ""}
          </button>
        );
      })}
    </div>
  );
};
