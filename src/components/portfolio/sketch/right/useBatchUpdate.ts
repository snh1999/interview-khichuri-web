import { useRef } from "react";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { ElementChanges } from "../types";

/**
 * Returns a batch updater that applies `changes` to every selected element,
 * recording one debounced history entry (3s window) so slider drags don't flood
 * the undo stack.
 *
 * The debounce window alone is not enough: if an undo/redo replaces the history
 * while the window is still open, the next edit would be silently folded into a
 * discarded entry. So a batch also ends whenever the store's history object
 * changes out from under it.
 */
export const useBatchUpdate = (selectedElements: { id: string }[]) => {
  const updateElements = useSketchBuilderStore((s) => s.updateElements);
  const recordHistory = useSketchBuilderStore((s) => s.recordHistory);

  const historyDebounceRef = useRef<number | null>(null);
  // History object produced by our last recordHistory(); a different identity
  // means undo/redo (or another action) started a fresh edit batch.
  const lastHistoryRef = useRef<unknown>(null);

  return (changes: ElementChanges, shouldRecordHistory = true) => {
    const { history } = useSketchBuilderStore.getState();
    const historyChanged = history !== lastHistoryRef.current;
    const withinWindow = historyDebounceRef.current !== null;
    if (shouldRecordHistory && (historyChanged || !withinWindow)) {
      if (historyDebounceRef.current) {
        window.clearTimeout(historyDebounceRef.current);
      }
      recordHistory();
      lastHistoryRef.current = useSketchBuilderStore.getState().history;
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
