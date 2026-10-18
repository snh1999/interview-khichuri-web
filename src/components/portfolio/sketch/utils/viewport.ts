import type { CanvasElement } from "../types";

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Returns a viewport that centers the given element in the visible canvas area.
 * The left offset accounts for the left sidebar when it is shown.
 */
export function getCenteredViewport(
  element: Pick<CanvasElement, "x" | "y" | "width" | "height">,
  viewport: Viewport
): Viewport {
  const { zoom } = viewport;
  const canvasWidth =
    typeof window === "undefined" ? 800 : window.innerWidth - 320;
  const canvasHeight =
    typeof window === "undefined" ? 600 : window.innerHeight - 80;
  return {
    x: -element.x * zoom + canvasWidth / 2 - (element.width * zoom) / 2,
    y: -element.y * zoom + canvasHeight / 2 - (element.height * zoom) / 2,
    zoom,
  };
}
