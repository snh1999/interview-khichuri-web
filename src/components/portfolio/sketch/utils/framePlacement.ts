import type { CanvasElement } from "../types";

const FRAME_GAP = 80;
const CANVAS_ORIGIN = 80;
const CANVAS_TOP = 60;

/**
 * Places a new frame to the right of the rightmost existing frame so frames
 * never overlap. Returns the top-left origin for the new frame.
 */
export function getEmptyFramePosition(elements: CanvasElement[]): {
  x: number;
  y: number;
} {
  const frames = elements.filter((el) => el.type === "frame");
  if (frames.length === 0) {
    return { x: CANVAS_ORIGIN, y: CANVAS_TOP };
  }
  const rightmost = Math.max(...frames.map((f) => f.x + f.width));
  return { x: rightmost + FRAME_GAP, y: CANVAS_TOP };
}
