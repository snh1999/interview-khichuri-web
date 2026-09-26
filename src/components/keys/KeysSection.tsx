import { ShieldCheckIcon } from "@phosphor-icons/react";
import {
  type IApiKey,
  PROVIDER_LABELS,
  type TApiKeyProvider,
  useApiKeys,
} from "@/api/keys";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { ApiKeyCard } from "@/components/keys/ApiKeyCard.tsx";
import { KeysFormDialog } from "@/components/keys/KeysFormDialog.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { useAppStore } from "@/store/appStore.ts";

const groupKeysByProvider = (
  keys: IApiKey[]
): Map<TApiKeyProvider, IApiKey[]> => {
  const grouped = new Map<TApiKeyProvider, IApiKey[]>();
  for (const key of keys) {
    const existing = grouped.get(key.provider) ?? [];
    existing.push(key);
    grouped.set(key.provider, existing);
  }
  return grouped;
};

const KeysSection = () => (
  <AppErrorSuspense>
    <KeysCard />
  </AppErrorSuspense>
);

const KeysCard = () => {
  const { data: apiKeys } = useApiKeys();

  const grouped = apiKeys ? groupKeysByProvider(apiKeys) : new Map();

  const defaultAiProvider = useAppStore((state) => state.defaultAiProvider);

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Manage your AI provider API keys for question generation.
        </CardDescription>
        <CardAction>
          <KeysFormDialog />
        </CardAction>
      </CardHeader>
      <CardContent>
        {apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([provider, keys]) => (
              <div className="space-y-3" key={provider}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex gap-2 pt-3 text-md">
                    {PROVIDER_LABELS[provider as TApiKeyProvider]}
                    {defaultAiProvider?.provider === provider ? (
                      <ShieldCheckIcon
                        className="text-signal-success"
                        weight="fill"
                      />
                    ) : null}
                  </CardTitle>
                </div>

                {keys.map((key: IApiKey) => (
                  <ApiKeyCard
                    apiKey={key}
                    isPrimary={defaultAiProvider?.provider === provider}
                    key={key.id}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No API keys</EmptyTitle>
              <EmptyDescription>
                Add an API key to start using AI-powered features.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
};

export default KeysSection;
