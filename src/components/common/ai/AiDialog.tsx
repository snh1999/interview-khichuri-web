import { SparkleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { PROVIDER_LABELS, type TApiKeyProvider, useApiKeys } from "@/api/keys";
import { SETTINGS_PAGE } from "@/app.constants.ts";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/ui/button/AsyncButton";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecute: (provider: string, model?: string) => void;
  title: string;
  description?: string;
  executeLabel?: string;
  isLoading?: boolean;
  executeDisabled?: boolean;
  children?: ReactNode;
}

export const AiDialog = ({
  open,
  onOpenChange,
  onExecute,
  title,
  description,
  executeLabel = "Send",
  isLoading = false,
  executeDisabled = false,
  children,
}: Readonly<AiDialogProps>) => {
  const { data: apiKeys } = useApiKeys();
  const providers = [
    ...new Set(
      (apiKeys ?? []).filter((key) => key.isActive).map((key) => key.provider)
    ),
  ];
  const hasProviders = providers.length > 0;

  const [provider, setProvider] = useState<TApiKeyProvider | null>(() =>
    hasProviders ? providers[0] : null
  );

  const [model, setModel] = useState<string>("");

  const providerItems = providers.map((p) => ({
    value: p,
    label: PROVIDER_LABELS[p],
  }));

  const handleExecute = () => {
    if (!provider) {
      return;
    }
    onExecute(provider, model);
  };

  const handleSelect = (v: TApiKeyProvider | null) => {
    if (v) {
      setProvider(v);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setModel(e.target.value);

  return (
    <DrawLog onOpenChange={onOpenChange} open={open}>
      <DrawLogContent>
        <DrawLogHeader>
          <DrawLogTitle className="flex items-center gap-2">
            <SparkleIcon />
            {title}
          </DrawLogTitle>
          {description ? (
            <DrawLogDescription>{description}</DrawLogDescription>
          ) : null}
        </DrawLogHeader>

        <DrawLogBody>
          {hasProviders ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="font-medium text-muted-foreground text-xs">
                  AI Provider
                </span>
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

              <div className="space-y-4">
                <span className="font-medium text-muted-foreground text-xs">
                  Model Name
                </span>
                <Input
                  disabled={isLoading}
                  onChange={handleModelChange}
                  placeholder="Name of specific model (optional)"
                  value={model}
                />

                {children}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No AI providers available.{" "}
              <Link className="underline" to={SETTINGS_PAGE}>
                Add an API key in Settings
              </Link>
            </p>
          )}
        </DrawLogBody>

        <DrawLogFooter className="pt-2">
          <DrawLogClose render={<Button variant="outline">Cancel</Button>} />
          <AsyncButton
            disabled={!hasProviders || executeDisabled}
            isLoading={isLoading}
            onClick={handleExecute}
          >
            {executeLabel}
          </AsyncButton>
        </DrawLogFooter>
      </DrawLogContent>
    </DrawLog>
  );
};
