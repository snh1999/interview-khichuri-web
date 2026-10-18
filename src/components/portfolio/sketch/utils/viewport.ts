import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { CanvasElement } from "../types";

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Returns a viewport that centers the given element in the visible canvas area.
 * The canvas size is the measured flex slot between the sidebars (kept current
 * by the Canvas via `canvasSize`); a window-based estimate is only a fallback
 * for the brief moment before the first measurement lands.
 */
export function getCenteredViewport(
  element: Pick<CanvasElement, "x" | "y" | "width" | "height">,
  viewport: Viewport
): Viewport {
  const { zoom } = viewport;
  const { width, height } = useSketchBuilderStore.getState().canvasSize;
  const canvasWidth =
    width || (typeof window === "undefined" ? 800 : window.innerWidth - 320);
  const canvasHeight =
    height || (typeof window === "undefined" ? 600 : window.innerHeight - 80);
  return {
    x: -element.x * zoom + canvasWidth / 2 - (element.width * zoom) / 2,
    y: -element.y * zoom + canvasHeight / 2 - (element.height * zoom) / 2,
    zoom,
  };
}
