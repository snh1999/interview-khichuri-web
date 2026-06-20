import { type IApiKey, type TApiKeyPlatform, useApiKeys } from "@/api/keys";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { ApiKeyCard } from "@/components/settings/keys/ApiKeyCard.tsx";
import { KeysFormDialog } from "@/components/settings/keys/KeysFormDialog.tsx";
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

const PLATFORM_LABELS: Record<TApiKeyPlatform, string> = {
  google: "Google / Gemini",
  openai: "OpenAI / ChatGPT",
};

const groupKeysByPlatform = (
  keys: IApiKey[]
): Map<TApiKeyPlatform, IApiKey[]> => {
  const grouped = new Map<TApiKeyPlatform, IApiKey[]>();
  for (const key of keys) {
    const existing = grouped.get(key.platform) ?? [];
    existing.push(key);
    grouped.set(key.platform, existing);
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

  const grouped = apiKeys ? groupKeysByPlatform(apiKeys) : new Map();

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
            {Array.from(grouped.entries()).map(([platform, keys]) => (
              <div className="space-y-3" key={platform}>
                <CardTitle className="pt-3 text-sm">
                  {PLATFORM_LABELS[platform as TApiKeyPlatform]}
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
