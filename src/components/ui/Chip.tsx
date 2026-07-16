import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ComponentPropsWithoutRef } from "react";

interface ChipProps extends ComponentPropsWithoutRef<"span"> {
  onRemove?: () => void;
  disabled?: boolean;
}

export function Chip({
  className,
  children,
  onRemove,
  disabled,
  ...props
}: ChipProps) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "bg-muted-foreground/10 text-foreground flex h-[calc(--spacing(4.75))] w-fit items-center justify-center gap-1 rounded-[calc(var(--radius-sm)-2px)] px-1.5 text-xs/relaxed font-medium whitespace-nowrap",
        onRemove && "pr-0",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <Button
          className="-ml-1 opacity-50 hover:opacity-100"
          disabled={disabled}
          onClick={onRemove}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <XIcon className="pointer-events-none" />
        </Button>
      )}
    </span>
  );
}
