import type React from "react";

interface SelectionMarqueeProps {
  box: { startX: number; startY: number; endX: number; endY: number };
}

export const SelectionMarquee: React.FC<SelectionMarqueeProps> = ({ box }) => (
  <rect
    fill="var(--primary)"
    fillOpacity={0.1}
    height={Math.abs(box.endY - box.startY)}
    stroke="var(--primary)"
    strokeDasharray="4 4"
    strokeWidth={1}
    width={Math.abs(box.endX - box.startX)}
    x={Math.min(box.startX, box.endX)}
    y={Math.min(box.startY, box.endY)}
  />
);
