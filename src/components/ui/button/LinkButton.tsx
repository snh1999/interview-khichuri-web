import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils.ts";

export function LinkButton({
  children,
  path,
  className,
  pop,
  replace,
  ...props
}: ComponentProps<typeof Button> & {
  path: string;
  pop?: boolean;
  replace?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <Button
      {...props}
      variant="link"
      className={cn(
        "text-md",
        pop ? "bg-primary/5 hover:bg-primary/15" : "",
        className
      )}
      onClick={() => {
        navigate(path, { replace: replace });
      }}
      style={{ textDecoration: "none" }}
    >
      {children}
    </Button>
  );
}
