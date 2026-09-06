import type { KeyboardEvent, ReactNode } from "react";

import { STATUS_STYLES, type StatusVariant } from "@/lib/status-styles.ts";
import { cn } from "@/lib/utils.ts";

interface GutterCardProps {
  variant: StatusVariant;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

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
