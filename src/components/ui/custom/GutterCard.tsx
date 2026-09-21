// impeccable-disable side-tab: committed Gutter Rule (DESIGN.md) — status lives on the left edge
import type { KeyboardEvent, ReactNode } from "react";

import { cn } from "cn";

export type StatusVariant = "default" | "success" | "warning" | "danger";


interface GutterCardProps {
  variant: StatusVariant;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

interface StatusStyle {
  gutter: string;
  badgeBg: string;
  badgeText: string;
  label: string;
}

const STATUS_STYLES: Record<StatusVariant, StatusStyle> = {
  default: {
    gutter: "border-l-muted-foreground",
    badgeBg: "bg-muted",
    badgeText: "text-muted-foreground",
    label: "neutral",
  },
  success: {
    gutter: "border-l-signal-success",
    badgeBg: "bg-signal-success/10",
    badgeText: "text-signal-success-foreground",
    label: "active",
  },
  warning: {
    gutter: "border-l-signal-warning",
    badgeBg: "bg-signal-warning/10",
    badgeText: "text-signal-warning-foreground",
    label: "upcoming",
  },
  danger: {
    gutter: "border-l-signal-danger",
    badgeBg: "bg-signal-danger/10",
    badgeText: "text-signal-danger-foreground",
    label: "urgent",
  },
};


export const GutterCard = ({
  variant,
  children,
  onClick,
  className,
}: GutterCardProps) => {
  const style = STATUS_STYLES[variant];

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "border-border rounded-xs border-l-2 bg-card py-2 px-4 text-left transition-colors",
        style.gutter,
        onClick ? "cursor-pointer hover:bg-muted/40" : "",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};
