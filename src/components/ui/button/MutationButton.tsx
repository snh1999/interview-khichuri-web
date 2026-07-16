import type { ComponentProps, ReactElement } from "react";
import { ActionButton } from "@/components/ui/button/ActionButton.tsx";

interface IProps {
  mutationFn: () => Promise<unknown>;
  successMessage: string;
  failFallbackMessage?: string;
  renderNode?: ReactElement;
}

export const MutationButton = ({
  mutationFn,
  successMessage,
  failFallbackMessage = "Something went wrong",
  ...props
}: Omit<ComponentProps<typeof ActionButton>, "action"> & Readonly<IProps>) => (
  <ActionButton
    {...props}
    action={async () => {
      try {
        await mutationFn();
        return { error: false, message: successMessage };
      } catch (error) {
        return {
          error: true,
          message:
            error instanceof Error ? error.message : failFallbackMessage,
        };
      }
    }}
  />
);
