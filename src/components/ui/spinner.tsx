import { cn } from "@/lib/utils";
import { CircleNotchIcon } from "@phosphor-icons/react";

export function Spinner({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"svg"> & { containerClassName?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center pt-4",
        containerClassName
      )}
    >
      <CircleNotchIcon
        role="status"
        aria-label="Loading"
        className={cn("size-4 animate-spin", className)}
        {...props}
      />
    </div>
  );
}
