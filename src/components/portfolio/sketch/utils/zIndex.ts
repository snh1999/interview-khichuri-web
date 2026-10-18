import type { CanvasElement } from "../types";

export const getNextZIndex = (elements: CanvasElement[]): number =>
  elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0) + 1;
