import type React from "react";
import type { CanvasElement, FrameElement, PenElement } from "../types";

interface DrawingPreviewProps {
  element: CanvasElement;
}

/** The translucent element shown while the user is actively drawing it. */
export const DrawingPreview: React.FC<DrawingPreviewProps> = ({ element }) => (
  <g opacity={0.8}>
    {element.type === "pen" && (
      <path
        d={(element as PenElement).points
          .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ")}
        fill="none"
        stroke={element.strokeColor}
        strokeLinecap="round"
        strokeWidth={element.strokeWidth}
      />
    )}
    {["rectangle", "frame"].includes(element.type) && (
      <rect
        fill={
          element.fillColor || (element as FrameElement).background || "#ffffff"
        }
        height={element.height}
        rx={8}
        stroke={element.strokeColor}
        strokeWidth={element.strokeWidth}
        width={element.width}
        x={element.x}
        y={element.y}
      />
    )}
    {element.type === "ellipse" && (
      <ellipse
        cx={element.x + element.width / 2}
        cy={element.y + element.height / 2}
        fill={element.fillColor || "transparent"}
        rx={element.width / 2}
        ry={element.height / 2}
        stroke={element.strokeColor}
        strokeWidth={element.strokeWidth}
      />
    )}
    {(element.type === "line" || element.type === "arrow") && (
      <line
        stroke={element.strokeColor || "currentColor"}
        strokeLinecap="round"
        strokeWidth={element.strokeWidth || 2}
        x1={element.x}
        x2={element.endX ?? element.x + element.width}
        y1={element.y}
        y2={element.endY ?? element.y + element.height}
      />
    )}
  </g>
);
