import { useCallback, useRef, useState } from "react";
import { DEFAULT_CLICK_DURATION_MINUTES, yToTime } from "../calendar.helpers";

export interface DragState {
  startDayIndex: number;
  startY: number;
  currentDayIndex: number;
  currentY: number;
}

const EVENT_TARGET_SELECTOR = "[data-calendar-event]";

export const useTimeGridDrag = (
  days: Date[],
  onSlotSelect: (start: Date, end: Date, allDay?: boolean) => void
) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  // Typed nullable so Biome sees cross-handler mutation as real state.
  const pointerDownClientY = useRef(0);
  const hasDragged = useRef<boolean | undefined>(undefined);
  // Pressing an event chip starts a potential drag too; only a release
  // without movement falls through to the chip's own click handler.
  const pressedOnEventRef = useRef<boolean | undefined>(undefined);
  const pendingClickSuppressionRef = useRef<boolean | undefined>(undefined);
  const [drag, setDrag] = useState<DragState | null>(null);

  const getDayIndexFromX = useCallback(
    (clientX: number) => {
      const rect = rowRef.current?.getBoundingClientRect();
      if (!rect) {
        return 0;
      }
      const dayWidth = rect.width / days.length;
      const idx = Math.floor((clientX - rect.left) / dayWidth);
      return Math.max(0, Math.min(days.length - 1, idx));
    },
    [days.length]
  );

  const getYFromClientY = useCallback((clientY: number) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) {
      return 0;
    }
    return clientY - rect.top;
  }, []);

  // Attached once on the shared grid container so presses on event chips,
  // spanning bars, and empty space all start a potential drag.
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const y = getYFromClientY(e.clientY);
      const dayIndex = getDayIndexFromX(e.clientX);
      pointerDownClientY.current = e.clientY;
      hasDragged.current = false;
      pressedOnEventRef.current = Boolean(
        (e.target as HTMLElement).closest?.(EVENT_TARGET_SELECTOR)
      );
      setDrag({
        startDayIndex: dayIndex,
        startY: y,
        currentDayIndex: dayIndex,
        currentY: y,
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [getDayIndexFromX, getYFromClientY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) {
        return;
      }
      if (Math.abs(e.clientY - pointerDownClientY.current) > 4) {
        hasDragged.current = true;
      }
      const dayIndex = getDayIndexFromX(e.clientX);
      if (dayIndex !== drag.startDayIndex) {
        hasDragged.current = true;
      }
      const y = getYFromClientY(e.clientY);
      setDrag((prev) =>
        prev ? { ...prev, currentDayIndex: dayIndex, currentY: y } : prev
      );
    },
    [drag, getDayIndexFromX, getYFromClientY]
  );

  const handlePointerUp = useCallback(() => {
    if (!drag) {
      return;
    }

    // Press on an event chip + release without movement = click; skip the
    // slot selection so the chip's own handler opens the event.
    // biome-ignore lint/suspicious/noUnnecessaryConditions: ref is mutated across handlers
    if (!hasDragged.current && pressedOnEventRef.current) {
      setDrag(null);
      return;
    }
    const isMultiDay = drag.startDayIndex !== drag.currentDayIndex;

    if (isMultiDay) {
      const lo = Math.min(drag.startDayIndex, drag.currentDayIndex);
      const hi = Math.max(drag.startDayIndex, drag.currentDayIndex);
      const start = new Date(days[lo]);
      start.setHours(0, 0, 0, 0);
      const end = new Date(days[hi]);
      end.setHours(23, 59, 59, 999);
      onSlotSelect(start, end, true);
    } else {
      const day = days[drag.startDayIndex];
      const loY = Math.min(drag.startY, drag.currentY);
      const hiY = Math.max(drag.startY, drag.currentY);
      const start = yToTime(loY, day);

      // biome-ignore lint/suspicious/noUnnecessaryConditions: ref is mutated in handlePointerMove
      if (hasDragged.current && hiY - loY > 4) {
        onSlotSelect(start, yToTime(hiY, day), false);
      } else {
        const end = new Date(
          start.getTime() + DEFAULT_CLICK_DURATION_MINUTES * 60_000
        );
        onSlotSelect(start, end, false);
      }
    }
    // Pointer capture routes the trailing click back to the pressed chip;
    // a committed drag must not also open it.
    pendingClickSuppressionRef.current =
      // biome-ignore lint/suspicious/noUnnecessaryConditions: ref is mutated across handlers
      hasDragged.current && pressedOnEventRef.current;
    setDrag(null);
  }, [drag, days, onSlotSelect]);

  // pointercancel fires on touch-gesture takeover, alt-tab mid-drag, etc.;
  // abort the drag without committing a slot selection.
  const handlePointerCancel = useCallback(() => {
    pendingClickSuppressionRef.current = false;
    setDrag(null);
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: ref is mutated in handlePointerUp
    if (!pendingClickSuppressionRef.current) {
      return;
    }
    pendingClickSuppressionRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return {
    handleClickCapture,
    rowRef,
    drag,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
};
