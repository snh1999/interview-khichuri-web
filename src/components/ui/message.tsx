import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MessageProps = {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
};

export function Message({ children, align = "left", className }: MessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        align === "right" ? "items-end" : "items-start",
        className
      )}
    >
      {children}
    </div>
  );
}
