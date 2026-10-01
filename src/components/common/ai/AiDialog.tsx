import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router";
import { PROVIDER_LABELS, type TApiKeyProvider } from "@/api/keys";
import { SETTINGS_PAGE } from "@/app.constants.ts";
import { useAIProvider } from "@/components/common/ai/ai.hook.ts";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { KeysFormDialog } from "@/components/keys/KeysFormDialog.tsx";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/ui/button/AsyncButton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DrawLog,
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogDescription,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/appStore.ts";

export interface AiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecute: (provider: string, model?: string) => void;
  title: string;
  description?: string;
  executeLabel?: string;
  isLoading?: boolean;
  executeDisabled?: boolean;
  useSavedDefaults?: boolean;
  children?: ReactNode;
}

export const AiDialog = (props: Readonly<AiDialogProps>) => (
  <AppErrorSuspense>
    <AiDialogContent {...props} />
  </AppErrorSuspense>
);

const AiDialogContent = ({
  open,
  onOpenChange,
  onExecute,
  title,
  description,
  executeLabel = "Send",
  isLoading = false,
  executeDisabled = false,
  useSavedDefaults = false,
  children,
}: Readonly<AiDialogProps>) => {
  const {
    providers,
    initialProvider,
    initialModel,
    hasProviders,
    defaultAiProvider,
  } = useAIProvider();

  const setDefaultAiProvider = useAppStore(
    (state) => state.setDefaultAiProvider
  );
  const skipAiDialog = useAppStore((state) => state.skipAiDialog);
  const setSkipAiDialog = useAppStore((state) => state.setSkipAiDialog);

  const [provider, setProvider] = useState<TApiKeyProvider | null>(
    initialProvider
  );

  const [model, setModel] = useState<string>(initialModel);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <re-seed only on open/provider-set changes>
  useEffect(() => {
    if (!open) {
      return;
    }
    setProvider(initialProvider);
    setModel(initialModel);
  }, [open, providers]);

  const providerChanged =
    !useSavedDefaults &&
    (provider !== defaultAiProvider?.provider ||
      model.trim() !== (defaultAiProvider?.model ?? ""));

  const handleDefaultChange = (checked: boolean) => {
    if (checked && provider) {
      setDefaultAiProvider({ provider, model: model.trim() || undefined });
    }
  };

  const providerItems = providers.map((p) => ({
    value: p,
    label: PROVIDER_LABELS[p],
  }));

  const handleExecute = () => {
    if (!provider) {
      return;
    }
    onExecute(provider, model.trim() || undefined);
  };

  const handleSelect = (v: TApiKeyProvider | null) => {
    if (v && v !== provider) {
      setProvider(v);
      setModel("");
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setModel(e.target.value);

  return (
    <DrawLog onOpenChange={onOpenChange} open={open}>
      <DrawLogContent>
        <DrawLogHeader>
          <DrawLogTitle className="flex items-center gap-2">
            {title}
          </DrawLogTitle>
          {description ? (
            <DrawLogDescription>{description}</DrawLogDescription>
          ) : null}
        </DrawLogHeader>

        <DrawLogBody>
          {hasProviders ? (
            <div className="space-y-3 *:text-muted-foreground *:text-sm">
              {useSavedDefaults ? (
                <p className="text-muted-foreground text-sm">
                  Runs on your default provider{" "}
                  {provider ? PROVIDER_LABELS[provider] : ""}
                  {model ? ` (${model})` : ""}.
                </p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div>AI Provider</div>
                    <Select
                      items={providerItems}
                      onValueChange={handleSelect}
                      value={provider}
                    >
                      <SelectTrigger className="w-full" disabled={isLoading}>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {providers.map((p) => (
                            <SelectItem key={p} value={p}>
                              {PROVIDER_LABELS[p]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <div>Model Name</div>
                    <Input
                      disabled={isLoading}
                      onChange={handleModelChange}
                      placeholder="Name of specific model (optional)"
                      value={model}
                    />
                  </div>
                </>
              )}

              {children}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No AI providers available. </EmptyTitle>
                <EmptyDescription>
                  <Link
                    className="flex underline"
                    to={`${SETTINGS_PAGE}?tab=keys`}
                  >
                    Manage API keys from Settings
                    <ArrowSquareOutIcon />
                  </Link>
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <KeysFormDialog
                  isActive
                  label="Add New Key"
                  variant="default"
                />
              </EmptyContent>
            </Empty>
          )}
        </DrawLogBody>

        <DrawLogFooter className="justify-between! pt-2">
          {hasProviders ? (
            <div className="space-y-4 pl-2">
              {providerChanged ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    disabled={isLoading}
                    id="ai-set-default"
                    onCheckedChange={handleDefaultChange}
                  />
                  <Label htmlFor="ai-set-default">
                    Set provider as default
                  </Label>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={skipAiDialog}
                  disabled={isLoading}
                  id="ai-skip-dialog"
                  onCheckedChange={setSkipAiDialog}
                />
                <Label htmlFor="ai-skip-dialog">
                  Do not show dialog for AI tasks
                </Label>
              </div>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-end gap-2">
            <DrawLogClose render={<Button variant="outline">Cancel</Button>} />
            <AsyncButton
              disabled={!hasProviders || executeDisabled}
              isLoading={isLoading}
              onClick={handleExecute}
            >
              {executeLabel}
            </AsyncButton>
          </div>
        </DrawLogFooter>
      </DrawLogContent>
    </DrawLog>
  );
};
