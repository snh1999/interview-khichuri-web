import { cn } from "@/lib/utils";
import { getEventColors } from "./calendar.helpers";
import type { TCustomEvent, TJobEvent } from "./calendar.types";

interface Props {
  event: TJobEvent | TCustomEvent;
  compact?: boolean;
  onCustomClick?: (event: TJobEvent | TCustomEvent) => void;
}

export const CalendarEvent = ({
  event,
  compact = false,
  onCustomClick,
}: Props) => {
  const colors = getEventColors(event);

  const handleClick = () => {
    onCustomClick?.(event);
  };

  const stopPropagation = (e: React.PointerEvent<HTMLButtonElement>) =>
    e.stopPropagation();

  const label = event.title;
  const subtitle = "companyName" in event ? ` — ${event.companyName}` : "";

  if (compact) {
    return (
      <button
        aria-label={`${event.source}: ${label}`}
        className={cn("flex h-1.5 w-1.5 shrink-0 rounded-full", colors.dot)}
        onClick={handleClick}
        type="button"
      />
    );
  }

  return (
    <button
      className={cn(
        "flex w-full min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap rounded-md px-1.5 py-1 font-medium text-xs leading-tight shadow-sm transition-opacity hover:opacity-80",
        colors.bg,
        colors.text
      )}
      onClick={handleClick}
      onPointerDown={stopPropagation}
      title={`${label}${subtitle}`}
      type="button"
    >
      <span className="min-w-0 flex-1 truncate text-center">{label}</span>
      {/* TODO: Restore cloud sync icon once Google OAuth calendar.events scope is approved */}
    </button>
  );
};
