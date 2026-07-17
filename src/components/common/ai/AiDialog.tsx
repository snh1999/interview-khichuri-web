"use client";

import { SparkleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { PROVIDER_LABELS, type TApiKeyProvider, useApiKeys } from "@/api/keys";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/ui/button/AsyncButton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  // onExecute: (
  //   provider: string,
  //   model?: string,
  //   avoidRepeat?: boolean,
  //   includeJobDescription?: boolean
  // ) => void;
  title: string;
  description?: string;
  executeLabel?: string;
  isLoading?: boolean;
  // TODO: show the ones user have keys for (internal, no props)
  providers?: readonly string[];
  // TODO: remove this prop and show message internally
  providersEmptyMessage?: ReactNode;
  // showAvoidRepeatToggle?: boolean;
  // defaultAvoidRepeat?: boolean;
  // showIncludeJobDescriptionToggle?: boolean;
  // defaultIncludeJobDescription?: boolean;
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
  // providers = AI_PROVIDERS,
  providersEmptyMessage,
  // showAvoidRepeatToggle = false,
  // defaultAvoidRepeat = false,
  // showIncludeJobDescriptionToggle = false,
  // defaultIncludeJobDescription = true,
}: Readonly<AiDialogProps>) => {
  const { data: apiKeys } = useApiKeys();
  const providers = [
    ...new Set(
      apiKeys.filter((key) => key.isActive).map((key) => key.provider)
    ),
  ];
  const hasProviders = providers.length > 0;

  const [provider, setProvider] = useState<TApiKeyProvider | null>(() =>
    hasProviders ? providers[0] : null
  );

  const [model, setModel] = useState<string>("");
  // const [avoidRepeat, setAvoidRepeat] = useState<boolean>(defaultAvoidRepeat);
  // const [includeJobDescription, setIncludeJobDescription] = useState<boolean>(
  //   defaultIncludeJobDescription
  // );

  // useEffect(() => {
  //   if (providers.length > 0 && !providers.includes(provider)) {
  //     setProvider(providers[0]);
  //   }
  // }, [providers, provider]);

  // useEffect(() => {
  //   setAvoidRepeat(defaultAvoidRepeat);
  // }, [defaultAvoidRepeat]);
  //
  // useEffect(() => {
  //   setIncludeJobDescription(defaultIncludeJobDescription);
  // }, [defaultIncludeJobDescription]);

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

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparkleIcon />
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {hasProviders ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="font-medium text-muted-foreground text-xs">
                AI Provider
              </span>
              <Select
                items={providerItems}
                onValueChange={(v) => {
                  if (v) {
                    setProvider(v);
                  }
                }}
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
              <span className="font-medium text-muted-foreground text-xs">
                Model Name
              </span>
              <Input
                disabled={isLoading}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Name of specific model (optional)"
                value={model}
              />
            </div>

            {/*{showAvoidRepeatToggle ? (*/}
            {/*  <div className="flex items-center gap-2">*/}
            {/*    <Checkbox*/}
            {/*      checked={avoidRepeat}*/}
            {/*      disabled={isLoading}*/}
            {/*      id="avoid-repeat"*/}
            {/*      onCheckedChange={(val) => setAvoidRepeat(val === true)}*/}
            {/*    />*/}
            {/*    <Label htmlFor="avoid-repeat">*/}
            {/*      Avoid repeating previous questions*/}
            {/*    </Label>*/}
            {/*  </div>*/}
            {/*) : null}*/}

            {/*{showIncludeJobDescriptionToggle ? (*/}
            {/*  <div className="flex items-center gap-2">*/}
            {/*    <Checkbox*/}
            {/*      checked={includeJobDescription}*/}
            {/*      disabled={isLoading}*/}
            {/*      id="include-job-description"*/}
            {/*      onCheckedChange={(val) =>*/}
            {/*        setIncludeJobDescription(val === true)*/}
            {/*      }*/}
            {/*    />*/}
            {/*    <Label htmlFor="include-job-description">*/}
            {/*      Include job description*/}
            {/*    </Label>*/}
            {/*  </div>*/}
            {/*) : null}*/}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {providersEmptyMessage ??
              "No AI providers available. Add an API key in Settings."}
          </p>
        )}

        <DialogFooter className="pt-2">
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <AsyncButton
            disabled={!hasProviders}
            isLoading={isLoading}
            onClick={handleExecute}
          >
            {executeLabel}
          </AsyncButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
