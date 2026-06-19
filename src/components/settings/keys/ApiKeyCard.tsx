import { KeyIcon, TrashIcon } from "@phosphor-icons/react";
import type { IApiKey } from "@/api/keys";
import { useActivateApiKey, useDeleteApiKey } from "@/api/keys";
import { Badge } from "@/components/ui/badge.tsx";
import { ActionButton } from "@/components/ui/button/ActionButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface Props {
  apiKey: IApiKey;
}

export const ApiKeyCard = ({ apiKey }: Readonly<Props>) => {
  const { mutateAsync: activateKey } = useActivateApiKey();
  const { mutateAsync: deleteKey } = useDeleteApiKey();
  const isActive = apiKey.isActive === true;

  return (
    <Card className="px-3" size="sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <KeyIcon size={24} />
          <CardTitle className="text-sm">{apiKey.name}</CardTitle>
          <CardDescription>({apiKey.platform})</CardDescription>
        </div>
        <CardDescription>
          Created:{" "}
          {new Intl.DateTimeFormat(undefined, {
            dateStyle: "long",
          }).format(new Date(apiKey.createdAt))}
        </CardDescription>
        <CardAction className="flex items-center gap-3 pt-3">
          {isActive ? (
            <Badge>Active</Badge>
          ) : (
            <Button
              disabled={isActive}
              onClick={() => activateKey(apiKey.id)}
              size="sm"
              variant="secondary"
            >
              Activate
            </Button>
          )}
          <ActionButton
            action={async () => {
              await deleteKey(apiKey.id);
              return { error: false, message: "API key deleted" };
            }}
            dialogDescription="This will permanently delete this API key."
            requireConfirmation
            size="sm"
            variant="destructive"
          >
            <TrashIcon />
          </ActionButton>
        </CardAction>
      </CardHeader>
    </Card>
  );
};
