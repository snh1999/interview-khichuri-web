import { zodResolver } from "@hookform/resolvers/zod";
import { KeyIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";
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

interface Props {
  apiKey: IApiKey;
}

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  model: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

export const ApiKeyCard = ({ apiKey }: Readonly<Props>) => {
  const { mutateAsync: activateKey } = useActivateApiKey();
  const { mutateAsync: deleteKey } = useDeleteApiKey();
  const { mutateAsync: updateKey } = useUpdateApiKey();
  const [editOpen, setEditOpen] = useState(false);
  const isActive = apiKey.isActive === true;

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: apiKey.name,
      model: apiKey.model ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await updateKey({
      id: apiKey.id,
      name: data.name,
      model: data.model || null,
    });
    toast.success("API key updated");
    setEditOpen(false);
  });

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
                    onClick={() => form.reset()}
                    render={<Button variant="outline">Cancel</Button>}
                  />
                  <AsyncButton type="submit">Save</AsyncButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <MutationButton
            dialogDescription="This will permanently delete this API key."
            mutationFn={() => deleteKey(apiKey.id)}
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
