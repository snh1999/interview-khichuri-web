import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner.tsx";

export function LoadingSwap({
  isLoading,
  children,
  className,
}: {
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn("contents", isLoading && "invisible")}>{children}</div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
