import { CheckIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { type To, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { SETTINGS_PAGE } from "@/app.constants.ts";
import { AiDialog } from "@/components/common/ai/AiDialog.tsx";
import { useAIProvider } from "@/components/common/ai/ai.hook.ts";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SplitButton } from "@/components/ui/button/SplitButton";
import { useAppStore } from "@/store/appStore.ts";

interface IProps
  extends Omit<ComponentProps<typeof SplitButton>, "primary" | "items">,
    Omit<
      ComponentProps<typeof AiDialog>,
      "open" | "onOpenChange" | "onExecute"
    > {
  execute: (provider: string, model?: string) => Promise<void> | void;
  executeLabel: string;
  icon?: ReactNode;
  disabled?: boolean;
  toastDescription?: string;
  toastSuccessMessage?: string;
  toastErrorMessage?: string;
  viewTarget?: To;
  hideTarget?: boolean;
}

export const AiActionButton = (props: Readonly<IProps>) => (
  <AppErrorSuspense>
    <AiActionButtonContent {...props} />
  </AppErrorSuspense>
);

const AiActionButtonContent = ({
  execute,
  title,
  description,
  executeLabel,
  isLoading = false,
  executeDisabled = false,
  disabled = false,
  children,
  icon,
  toastDescription,
  toastSuccessMessage,
  toastErrorMessage,
  viewTarget,
  hideTarget,
  ...splitButtonProps
}: Readonly<IProps>) => {
  const { providers, initialProvider, initialModel } = useAIProvider();

  const skipAiDialog = useAppStore((state) => state.skipAiDialog);

  const [dialogOpen, setDialogOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const run = async (provider: string, model?: string) => {
    const id = toast.loading(toastDescription ?? `${executeLabel} with AI…`, {
      description: title,
    });
    try {
      await execute(provider, model);
      toast.success(toastSuccessMessage ?? "Done", {
        id,
        action: hideTarget
          ? null
          : {
              label: "View",
              onClick: () =>
                navigate(
                  viewTarget ?? `${location.pathname}${location.search}`
                ),
            },
      });
    } catch (error) {
      toast.error(
        toastErrorMessage ??
          (error instanceof Error ? error.message : "Something went wrong"),
        { id }
      );
    }
  };

  const openDialog = () => setDialogOpen(true);

  const runDefault = () => {
    if (initialProvider) {
      run(initialProvider, initialModel.trim() || undefined);
    }
  };

  const handlePrimary = () => {
    if (skipAiDialog && initialProvider && !executeDisabled) {
      runDefault();
      return;
    }
    openDialog();
  };

  const handleDialogExecute = (provider: string, model?: string) => {
    setDialogOpen(false);
    run(provider, model);
  };

  const canRunDefault = Boolean(initialProvider) && !executeDisabled;

  return (
    <>
      <SplitButton
        {...splitButtonProps}
        dropdownProps={{
          className: "w-50",
          align: "end",
        }}
        items={[
          {
            label: "Open dialog",
            onClick: openDialog,
            disabled: isLoading || disabled,
            className: skipAiDialog ? "" : "bg-muted border",
            icon: skipAiDialog ? null : <CheckIcon />,
          },
          {
            label: "Continue with default",
            onClick: runDefault,
            disabled: isLoading || disabled || !canRunDefault,
            className: skipAiDialog ? "bg-muted border" : "",
            icon: skipAiDialog ? <CheckIcon /> : null,
          },
          ...(providers.length === 0
            ? [
                {
                  label: "Add API key in Settings",
                  onClick: () => navigate(SETTINGS_PAGE),
                },
              ]
            : []),
        ]}
        primary={{
          label: executeLabel,
          onClick: handlePrimary,
          disabled: isLoading || disabled,
          icon,
        }}
      />

      <AiDialog
        description={description}
        executeDisabled={executeDisabled}
        executeLabel={executeLabel}
        isLoading={isLoading}
        onExecute={handleDialogExecute}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title={title}
      >
        {children}
      </AiDialog>
    </>
  );
};
