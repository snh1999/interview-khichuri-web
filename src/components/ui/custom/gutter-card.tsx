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
    gutter: "border-l-emerald-500",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    label: "active",
  },
  warning: {
    gutter: "border-l-amber-500",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-700 dark:text-amber-300",
    label: "upcoming",
  },
  danger: {
    gutter: "border-l-rose-500",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-700 dark:text-rose-300",
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
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "border-border rounded-xs border-l-4 bg-card py-2 px-4 text-left transition-colors",
        style.gutter,
        onClick ? "cursor-pointer hover:bg-muted/40" : "",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};
