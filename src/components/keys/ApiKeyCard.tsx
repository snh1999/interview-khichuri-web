import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyIcon,
  PencilIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { IApiKey } from "@/api/keys";
import {
  useActivateApiKey,
  useDeleteApiKey,
  useUpdateApiKey,
} from "@/api/keys";
import { MAX_SHORT_LENGTH } from "@/app.constants.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
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
import { useAppStore } from "@/store/appStore.ts";

interface Props {
  apiKey: IApiKey;
  isPrimary?: boolean;
}

const editSchema = z.object({
  model: z.string().max(MAX_SHORT_LENGTH).nullish(),
  name: z.string().min(1, "Name is required").max(MAX_SHORT_LENGTH),
});

type EditFormData = z.infer<typeof editSchema>;

export const ApiKeyCard = ({ apiKey, isPrimary }: Readonly<Props>) => {
  const { mutateAsync: activateKey } = useActivateApiKey();
  const { mutateAsync: deleteKey } = useDeleteApiKey();
  const { mutateAsync: updateKey } = useUpdateApiKey();
  const [editOpen, setEditOpen] = useState(false);
  const isActive = apiKey.isActive === true;

  const setDefaultAiProvider = useAppStore(
    (state) => state.setDefaultAiProvider
  );

  const handleSetPrimary = () =>
    setDefaultAiProvider({ provider: apiKey.provider, model: apiKey.model });

  const form = useForm<EditFormData>({
    defaultValues: {
      model: apiKey.model ?? "",
      name: apiKey.name,
    },
    resolver: zodResolver(editSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await updateKey({
      id: apiKey.id,
      model: data.model || null,
      name: data.name,
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
          Created:{" "}
          {new Intl.DateTimeFormat(undefined, {
            dateStyle: "long",
          }).format(new Date(apiKey.createdAt))}
        </CardDescription>
        <CardAction className="flex items-center gap-3 pt-3">
          {isActive ? (
            <div className={cn("flex items-center gap-1")}>
              {isPrimary ? (
                <ShieldCheckIcon
                  className="size-4 text-signal-success"
                  weight="fill"
                />
              ) : (
                <Button
                  onClick={handleSetPrimary}
                  size="xs"
                  variant="secondary"
                >
                  Set Primary
                </Button>
              )}
              <Badge>Active</Badge>
            </div>
          ) : (
            <Button
              disabled={isActive}
              onClick={handleActivateClick}
              size="sm"
              variant="secondary"
            >
              Activate
            </Button>
          )}

          <Dialog onOpenChange={setEditOpen} open={editOpen}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline">
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
                  placeholder="e.g. gemini-2.0-flash"
                />
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
