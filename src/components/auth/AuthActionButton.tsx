import type { ComponentProps } from "react";
import { ActionButton } from "@/components/ui/button/ActionButton.tsx";

export const AuthActionButton = ({
  action,
  successMessage,
  failFallbackMessage,
  ...props
}: Omit<ComponentProps<typeof ActionButton>, "action"> & {
  readonly action: () => Promise<{ error?: null | { message?: string } }>;
  readonly successMessage: string;
  readonly failFallbackMessage?: string;
}) => {
  const onClickAction = async () => {
    const result = await action();
    if (result.error) {
      return {
        error: true,
        message: result.error.message ?? failFallbackMessage,
      };
    }
    return { error: false, message: successMessage };
  };
  return <ActionButton className="pt-1" {...props} action={onClickAction} />;
};
