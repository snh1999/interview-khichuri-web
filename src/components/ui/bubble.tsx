import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const bubbleVariants = cva(
  "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
  {
    variants: {
      variant: {
        user: "bg-primary text-primary-foreground ml-auto rounded-br-sm",
        assistant: "bg-muted text-foreground border border-border rounded-bl-sm",
      },
    },
    defaultVariants: {
      variant: "assistant",
    },
  }
);

type BubbleProps = {
  children: ReactNode;
  variant?: VariantProps<typeof bubbleVariants>["variant"];
  className?: string;
};

export function Bubble({ children, variant, className }: BubbleProps) {
  return (
    <div className={cn(bubbleVariants({ variant }), className)}>{children}</div>
  );
}
