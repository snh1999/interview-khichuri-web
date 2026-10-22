import { zodResolver } from "@hookform/resolvers/zod";
import { KeyIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  type IApiKey,
  providerNeedsBaseUrl,
  useActivateApiKey,
  useDeleteApiKey,
  useUpdateApiKey,
} from "@/api/keys";
import { MAX_SHORT_LENGTH } from "@/app.constants.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import {
  baseUrlSchema,
  getBaseUrlPlaceholder,
  MODEL_PLACEHOLDER,
  requireBaseUrl,
} from "@/components/keys/key.schemas.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { formatDate } from "@/lib/date";
import { useAppStore } from "@/store/appStore.ts";

interface Props {
  apiKey: IApiKey;
  isPrimary?: boolean;
}

const editSchema = z.object({
  baseUrl: baseUrlSchema,
  model: z.string().max(MAX_SHORT_LENGTH).nullish(),
  name: z.string().min(1, "Name is required").max(MAX_SHORT_LENGTH),
});

const customProviderEditSchema = editSchema.superRefine(requireBaseUrl);

type EditFormData = z.infer<typeof editSchema>;

export const ApiKeyCard = ({ apiKey, isPrimary }: Readonly<Props>) => {
  const { mutateAsync: activateKey } = useActivateApiKey();
  const { mutateAsync: deleteKey } = useDeleteApiKey();
  const { mutateAsync: updateKey } = useUpdateApiKey();
  const [editOpen, setEditOpen] = useState(false);
  const isActive = apiKey.isActive === true;
  const needsBaseUrl = providerNeedsBaseUrl(apiKey.provider);

  const setDefaultAiProvider = useAppStore(
    (state) => state.setDefaultAiProvider
  );

  const handleSetPrimary = () =>
    setDefaultAiProvider({ provider: apiKey.provider, model: apiKey.model });

  const form = useForm<EditFormData>({
    defaultValues: {
      baseUrl: needsBaseUrl ? (apiKey.baseUrl ?? "") : "",
      model: apiKey.model ?? "",
      name: apiKey.name,
    },
    resolver: zodResolver(needsBaseUrl ? customProviderEditSchema : editSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await updateKey({
      id: apiKey.id,
      model: data.model || null,
      name: data.name,
      ...(needsBaseUrl ? { baseUrl: data.baseUrl?.trim() || null } : {}),
    });
    toast.success("API key updated");
    setEditOpen(false);
  });

  const handleActivateClick = () => activateKey(apiKey.id);
  const handleDelete = () => deleteKey(apiKey.id);
  const handleReset = () => form.reset();

  return (
    <Card className="px-3" size="sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <KeyIcon size={24} />
          <CardTitle className="text-sm">{apiKey.name}</CardTitle>
          <CardDescription>({apiKey.provider})</CardDescription>
        </div>
        {apiKey.model ? (
          <CardDescription>Model: {apiKey.model}</CardDescription>
        ) : null}
        <CardDescription>
          Created: {formatDate(apiKey.createdAt, "PPP")}
        </CardDescription>
        <CardAction className="flex items-center gap-3 pt-3">
          {isActive ? (
            <div className="flex items-center gap-1">
              {isPrimary ? null : (
                <Button
                  onClick={handleSetPrimary}
                  size="xs"
                  variant="secondary"
                >
                  Set default
                </Button>
              )}
              <Badge
                className="bg-signal-success/10 text-signal-success"
                variant="ghost"
              >
                Active key
              </Badge>
            </div>
          ) : (
            <Button onClick={handleActivateClick} size="sm" variant="secondary">
              Activate
            </Button>
          )}

          <Dialog onOpenChange={setEditOpen} open={editOpen}>
            <DialogTrigger
              render={
                <Button aria-label="Edit key" size="sm" variant="outline">
                  <PencilIcon />
                </Button>
              }
            />
            <DialogContent className="p-6">
              <DialogHeader>
                <DialogTitle className="text-sm">Edit API Key</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={onSubmit}>
                <FormInput form={form} label="Name" name="name" />
                <FormInput
                  form={form}
                  label="Model (optional)"
                  name="model"
                  placeholder={MODEL_PLACEHOLDER}
                />
                {needsBaseUrl ? (
                  <FormInput
                    form={form}
                    label="Base URL"
                    name="baseUrl"
                    placeholder={getBaseUrlPlaceholder(apiKey.provider)}
                  />
                ) : null}
                <div className="flex items-center justify-end gap-2">
                  <DialogClose
                    onClick={handleReset}
                    render={<Button variant="outline">Cancel</Button>}
                  />
                  <AsyncButton type="submit">Save</AsyncButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <MutationButton
            actionLabel="Delete key"
            aria-label="Delete key"
            dialogDescription="This will permanently delete this API key."
            dialogTitle="Delete this API key?"
            mutationFn={handleDelete}
            requireConfirmation
            size="sm"
            successMessage="API key deleted"
            variant="destructive"
          >
            <TrashIcon />
          </MutationButton>
        </CardAction>
      </CardHeader>
    </Card>
  );
};
