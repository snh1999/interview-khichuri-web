import { Button } from "@/components/ui/button.tsx";
import { LoadingSwap } from "@/components/ui/loading-swap.tsx";
import type { ComponentProps } from "react";

export function AsyncButton(
  props: ComponentProps<typeof Button> & {
    isLoading?: boolean;
  }
) {
  const { isLoading, disabled, children, ...buttonProps } = props;

  return (
    <Button
      {...buttonProps}
      disabled={disabled || isLoading}
      className={`${buttonProps.className || ""} inline-flex items-center justify-center gap-2`}
    >
      <LoadingSwap isLoading={isLoading}> {children}</LoadingSwap>
    </Button>
  );
}
