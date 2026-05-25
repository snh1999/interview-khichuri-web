import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

interface IProps {
  children?: ReactNode;
  compact?: boolean;
  noFooter?: boolean;
}
export const SkeletonCard = ({
  children,
  compact,
  noFooter,
}: Readonly<IProps>) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className={cn(compact ? "h-6" : "h-8", "w-1/3")} />
      </CardHeader>
      <CardContent className="w-full space-y-4">{children}</CardContent>
      {noFooter ? null : (
        <CardFooter className={cn(compact ? "pt-0" : "", "border-none")}>
          <Skeleton className="h-6 w-full" />
        </CardFooter>
      )}
    </Card>
  );
};
