import type { Icon } from "@phosphor-icons/react";
import {
  BriefcaseIcon,
  BrowsersIcon,
  ChartBarIcon,
  ChatTeardropTextIcon,
  EnvelopeSimpleIcon,
  FolderSimpleStarIcon,
  SparkleIcon,
  TextAlignLeftIcon,
  ToggleRightIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import type React from "react";
import type { StampElement, StampType } from "../types";
import { isColorLight } from "../utils/colorExtractor";

const STAMP_ICONS: Partial<Record<StampType, Icon>> = {
  navbar: BrowsersIcon,
  hero: UserCircleIcon,
  project: FolderSimpleStarIcon,
  skills: SparkleIcon,
  experience: BriefcaseIcon,
  testimonial: ChatTeardropTextIcon,
  contact: EnvelopeSimpleIcon,
  button: ToggleRightIcon,
  input: TextAlignLeftIcon,
  stats: ChartBarIcon,
};

interface StampShapeProps {
  el: StampElement;
  isSelected: boolean;
}

export const StampShape: React.FC<StampShapeProps> = ({ el, isSelected }) => {
  const isDarkCard = Boolean(
    el.fillColor &&
      el.fillColor !== "transparent" &&
      !isColorLight(el.fillColor)
  );
  const labelColor = isDarkCard ? "text-slate-100" : "text-slate-800";
  const sublabelColor = isDarkCard ? "text-slate-400" : "text-slate-500";
  const IconComponent = STAMP_ICONS[el.stampType];

  return (
    <g opacity={el.opacity ?? 1}>
      <rect
        fill={el.fillColor || "#ffffff"}
        height={el.height}
        rx={el.cornerRadius ?? 12}
        stroke={
          isSelected ? "var(--primary)" : el.strokeColor || "var(--border)"
        }
        strokeWidth={isSelected ? 2 : (el.strokeWidth ?? 1.5)}
        width={el.width}
        x={el.x}
        y={el.y}
      />
      <foreignObject height={el.height} width={el.width} x={el.x} y={el.y}>
        <div className="flex h-full w-full select-none flex-col justify-between overflow-hidden p-3 text-xs">
          <div className="flex items-center justify-between gap-1">
            <div
              className={`flex items-center gap-1.5 truncate font-bold ${labelColor}`}
            >
              {IconComponent ? (
                <IconComponent className="shrink-0" size={14} />
              ) : null}
              <span className="truncate">{el.label || el.name}</span>
            </div>
          </div>

          {el.sublabel ? (
            <div
              className={`line-clamp-3 text-xs leading-snug ${sublabelColor}`}
            >
              {el.sublabel}
            </div>
          ) : null}
        </div>
      </foreignObject>
    </g>
  );
};
