import { zodResolver } from "@hookform/resolvers/zod";
import { KeyIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateApiKey } from "@/api/keys";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.enum(["google", "openai"]),
  key: z.string().min(1, "API key is required"),
  isActive: z.boolean(),
});

const API_PROVIDERS = [
  {
    value: "google",
    label: "Google / Gemini",
  },
  {
    value: "openai",
    label: "OpenAI / ChatGPT",
  },
];

type CreateKeyFormData = z.infer<typeof createKeySchema>;

const useKeysForm = (onSuccess: () => void) => {
  const { mutateAsync: createKey, isPending } = useCreateApiKey();

  const form = useForm<CreateKeyFormData>({
    resolver: zodResolver(createKeySchema),
    defaultValues: { name: "", platform: "google", key: "", isActive: false },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await createKey(data, {
      onSuccess: () => {
        toast.success("API key saved");
        form.reset();
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to save API key");
      },
    });
  });

  return {
    onSubmit,
    form,
    isPending,
  };
};

export const KeysFormDialog = () => {
  const [open, setOpen] = useState(false);
  const closeDialog = () => {
    setOpen(false);
  };

  const { form, onSubmit, isPending } = useKeysForm(closeDialog);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <PlusIcon />
            New
          </Button>
        }
      />
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <KeyIcon />
            Add API Key
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <FormInput
            form={form}
            label="Name"
            name="name"
            placeholder="My Gemini key"
          />

          <FormSelect
            form={form}
            label={"Platform"}
            name={"platform"}
            selectData={API_PROVIDERS}
          />

          <FormInput
            form={form}
            label="API key"
            name="key"
            placeholder="Paste your API key"
            type="password"
          />

          <div className="flex justify-between align-center">
            <div className="flex-1">
              <FormCheckbox form={form} label="Set as active" name="isActive" />
            </div>

            <div className="flex items-center gap-2">
              <DialogClose
                onClick={() => form.reset()}
                render={<Button variant="outline">Cancel</Button>}
              />

              <AsyncButton isLoading={isPending} type="submit">
                Save
              </AsyncButton>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
