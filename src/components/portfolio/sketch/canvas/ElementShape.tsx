import type { CanvasElement } from "../types";
import { ImageShape } from "./ImageShape";
import { StampShape } from "./StampShape";

interface ElementShapeProps {
  el: CanvasElement;
  isSelected: boolean;
}

/**
 * Pure per-type renderer for a single canvas element. No handlers, no store —
 * only the SVG/HTML shape. Selection outline + resize handles are separate
 * (`SelectionHandles`), and the wireframe stamp is `StampShape`.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one renderer per element type; the union switch is inherent
export function ElementShape({ el, isSelected }: ElementShapeProps) {
  return (
    <>
      {el.type === "frame" && (
        <g>
          <rect
            className="shadow-xl"
            fill={el.fillColor ?? el.background ?? "#ffffff"}
            height={el.height}
            rx={el.cornerRadius ?? 16}
            stroke={
              isSelected ? "var(--primary)" : el.strokeColor || "var(--border)"
            }
            strokeWidth={isSelected ? 2.5 : (el.strokeWidth ?? 1.5)}
            width={el.width}
            x={el.x}
            y={el.y}
          />
        </g>
      )}

      {el.type === "rectangle" && (
        <rect
          fill={el.fillColor || "transparent"}
          height={el.height}
          opacity={el.opacity ?? 1}
          rx={el.cornerRadius ?? 8}
          stroke={el.strokeColor || "currentColor"}
          strokeWidth={el.strokeWidth ?? 2}
          width={el.width}
          x={el.x}
          y={el.y}
        />
      )}

      {el.type === "ellipse" && (
        <ellipse
          cx={el.x + el.width / 2}
          cy={el.y + el.height / 2}
          fill={el.fillColor || "transparent"}
          opacity={el.opacity ?? 1}
          rx={el.width / 2}
          ry={el.height / 2}
          stroke={el.strokeColor || "currentColor"}
          strokeWidth={el.strokeWidth ?? 2}
        />
      )}

      {el.type === "line" && (
        <line
          opacity={el.opacity ?? 1}
          stroke={el.strokeColor || "currentColor"}
          strokeLinecap="round"
          strokeWidth={el.strokeWidth ?? 2}
          x1={el.x}
          x2={el.endX ?? el.x + el.width}
          y1={el.y}
          y2={el.endY ?? el.y + el.height}
        />
      )}

      {el.type === "arrow" &&
        (() => {
          const startX = el.x;
          const startY = el.y;
          const endX = el.endX ?? el.x + el.width;
          const endY = el.endY ?? el.y + el.height;
          const angle = Math.atan2(endY - startY, endX - startX);
          const headLength = Math.max(10, (el.strokeWidth ?? 2) * 3.5);
          const arrowAngle = Math.PI / 7;
          const p1x = endX - headLength * Math.cos(angle - arrowAngle);
          const p1y = endY - headLength * Math.sin(angle - arrowAngle);
          const p2x = endX - headLength * Math.cos(angle + arrowAngle);
          const p2y = endY - headLength * Math.sin(angle + arrowAngle);

          return (
            <g>
              <line
                opacity={el.opacity ?? 1}
                stroke={el.strokeColor || "currentColor"}
                strokeLinecap="round"
                strokeWidth={el.strokeWidth ?? 2}
                x1={startX}
                x2={endX}
                y1={startY}
                y2={endY}
              />
              <polygon
                fill={el.strokeColor || "currentColor"}
                opacity={el.opacity ?? 1}
                points={`${endX},${endY} ${p1x},${p1y} ${p2x},${p2y}`}
              />
            </g>
          );
        })()}

      {el.type === "pen" && (
        <path
          d={el.points
            .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ")}
          fill="none"
          opacity={el.opacity ?? 1}
          stroke={el.strokeColor || "currentColor"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={el.strokeWidth ?? 2}
        />
      )}

      {el.type === "text" && (
        <text
          fill={
            el.text
              ? el.strokeColor || "currentColor"
              : "var(--muted-foreground)"
          }
          fontFamily={el.fontFamily || "sans-serif"}
          fontSize={el.fontSize || 16}
          fontWeight={el.fontWeight || "normal"}
          opacity={el.text ? (el.opacity ?? 1) : 0.6}
          x={el.x}
          y={el.y + (el.fontSize || 16)}
        >
          {el.text || "Double click to edit text"}
        </text>
      )}

      {el.type === "image" && <ImageShape el={el} />}

      {el.type === "stamp" && <StampShape el={el} isSelected={isSelected} />}
    </>
  );
}
