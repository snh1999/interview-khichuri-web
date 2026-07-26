import { cn } from "@/lib/utils";
import { SpinnerIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";

function Spinner({ className, ...props }: ComponentProps<"svg">) {
  return (
    <div className="flex justify-center items-center w-full h-full">
    <SpinnerIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
    </div>

  );
}

export { Spinner };
