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
    <div className="relative">
      <div className={cn(isLoading && "invisible", className)}>{children}</div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
