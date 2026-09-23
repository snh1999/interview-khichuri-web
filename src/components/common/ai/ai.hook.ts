import { useMemo } from "react";
import { useApiKeys } from "@/api/keys";
import { useAppStore } from "@/store/appStore.ts";

export const useAIProvider = () => {
  const { data: apiKeys } = useApiKeys();
  const providers = useMemo(
    () => [
      ...new Set(
        (apiKeys ?? []).filter((key) => key.isActive).map((key) => key.provider)
      ),
    ],
    [apiKeys]
  );
  const hasProviders = providers.length > 0;

  const defaultAiProvider = useAppStore((state) => state.defaultAiProvider);

  const initialProvider =
    (defaultAiProvider?.provider &&
    providers.includes(defaultAiProvider?.provider)
      ? defaultAiProvider?.provider
      : null) ?? (hasProviders ? providers[0] : null);

  const initialModel = defaultAiProvider?.model ?? "";

  return {
    providers,
    initialProvider,
    initialModel,
    hasProviders,
    defaultAiProvider,
  };
};
