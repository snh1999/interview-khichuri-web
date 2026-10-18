import type React from "react";
import type { CanvasElement } from "../types";

interface SelectionHandlesProps {
  el: CanvasElement;
  enabled: boolean;
  onResizeStart: (el: CanvasElement, pos: string) => void;
}

/**
 * Selection bounding box + four corner resize handles for a single element.
 * `enabled` mirrors the original `currentTool === "select"` guard so the
 * handles only start a resize in select mode.
 */
export const SelectionHandles: React.FC<SelectionHandlesProps> = ({
  el,
  enabled,
  onResizeStart,
}) => (
  <g>
    <rect
      fill="none"
      height={el.height + 6}
      stroke="var(--primary)"
      strokeDasharray="4 4"
      strokeWidth={1.5}
      width={el.width + 6}
      x={el.x - 3}
      y={el.y - 3}
    />

    {["nw", "ne", "se", "sw"].map((pos) => {
      const cx = pos.includes("e") ? el.x + el.width + 3 : el.x - 3;
      const cy = pos.includes("s") ? el.y + el.height + 3 : el.y - 3;
      const cursorClass =
        pos === "nw" || pos === "se"
          ? "cursor-nwse-resize"
          : "cursor-nesw-resize";
      return (
        // biome-ignore lint/a11y/noStaticElementInteractions: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
        <rect
          className={cursorClass}
          fill="hsl(var(--background))"
          height={8}
          key={pos}
          // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped handle position
          onMouseDown={(e) => {
            if (!enabled) {
              return;
            }
            e.stopPropagation();
            onResizeStart(el, pos);
          }}
          stroke="var(--primary)"
          strokeWidth={1.5}
          width={8}
          x={cx - 4}
          y={cy - 4}
        />
      );
    })}
  </g>
);
