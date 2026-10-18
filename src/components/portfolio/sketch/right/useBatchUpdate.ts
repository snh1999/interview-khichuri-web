import { useRef } from "react";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { ElementChanges } from "../types";

/**
 * Returns a batch updater that applies `changes` to every selected element,
 * recording one debounced history entry (3s window) so slider drags don't flood
 * the undo stack.
 */
export const useBatchUpdate = (selectedElements: { id: string }[]) => {
  const updateElements = useSketchBuilderStore((s) => s.updateElements);
  const recordHistory = useSketchBuilderStore((s) => s.recordHistory);

  // Debounced history recording to prevent slider drag flooding (3s window)
  // NOTE: If users report annoyance with undo granularity on rapid adjustments, alternative approach
  // is to record history on slider onPointerDown / onValueCommit instead of continuous value changes.
  const historyDebounceRef = useRef<number | null>(null);

  return (changes: ElementChanges, shouldRecordHistory = true) => {
    if (shouldRecordHistory && !historyDebounceRef.current) {
      recordHistory();
      historyDebounceRef.current = window.setTimeout(() => {
        historyDebounceRef.current = null;
      }, 3000);
    }
    updateElements(
      selectedElements.map((el) => ({
        id: el.id,
        changes,
      }))
    );
  };
};
