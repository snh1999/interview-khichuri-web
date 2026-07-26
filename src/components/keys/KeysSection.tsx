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
                <CardTitle className="pt-3 text-sm">
                  {PROVIDER_LABELS[provider as TApiKeyProvider]}
                </CardTitle>
                {keys.map((key: IApiKey) => (
                  <ApiKeyCard apiKey={key} key={key.id} />
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
