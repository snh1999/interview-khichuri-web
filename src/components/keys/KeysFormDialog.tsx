import { zodResolver } from "@hookform/resolvers/zod";
import { KeyIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ALL_PROVIDERS, PROVIDER_LABELS, useCreateApiKey } from "@/api/keys";
import { MAX_NAME_LENGTH, MAX_SHORT_LENGTH } from "@/app.constants.ts";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import { ProviderInfoCard } from "@/components/keys/info/ProviderInfoCard.tsx";
import type { TFormHook } from "@/components/prep-session/session/session.helpers.ts";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DrawLogClose,
  DrawLogContent,
  DrawLogHeader,
  DrawLogTitle,
  DrawLogTrigger,
} from "@/components/ui/custom/DrawLog.tsx";
import { FormDrawLogAlert } from "@/components/ui/custom/FormDrawLogAlert.tsx";

const API_PROVIDERS = Object.entries(PROVIDER_LABELS).map(([value, label]) => ({
  label,
  value,
}));

const createKeySchema = z.object({
  isActive: z.boolean(),
  key: z.string().min(1, "API key is required").max(MAX_NAME_LENGTH),
  model: z.string().max(MAX_SHORT_LENGTH).optional(),
  name: z.string().min(1, "Name is required").max(MAX_SHORT_LENGTH),
  provider: z.enum(ALL_PROVIDERS),
});

type TCreateKeyFormData = z.infer<typeof createKeySchema>;

const useKeysForm = (onSuccess: () => void): TFormHook<TCreateKeyFormData> => {
  const { mutateAsync: createKey, isPending: isLoading } = useCreateApiKey();

  const form = useForm<TCreateKeyFormData>({
    defaultValues: {
      isActive: false,
      key: "",
      model: "",
      name: "",
      provider: "google",
    },
    resolver: zodResolver(createKeySchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await createKey(
      { ...data, model: data.model?.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("API key saved");
          form.reset();
          onSuccess();
        },
      }
    );
  });

  return { form, isLoading, onSubmit };
};

export const KeysFormDialog = () => {
  const [open, setOpen] = useState(false);
  const closeDialog = () => {
    setOpen(false);
  };

  const { form, onSubmit, isLoading } = useKeysForm(closeDialog);

  const resetForm = () => form.reset();

  return (
    <FormDrawLogAlert
      isDirty={form.formState.isDirty}
      isEdit={false}
      isLoading={isLoading}
      onOpenChange={setOpen}
      open={open}
      type="key"
    >
      <DrawLogTrigger
        render={
          <Button variant="outline">
            <PlusCircleIcon />
            Add
          </Button>
        }
      />
      <DrawLogContent className="min-w-lg py-6">
        <DrawLogHeader>
          <DrawLogTitle className="flex items-center gap-2 text-sm">
            <KeyIcon />
            Add API Key
          </DrawLogTitle>
        </DrawLogHeader>
        <div className="no-scrollbar -mx-4 max-h-[79vh] overflow-y-auto px-4">
          <form className="space-y-4 px-4 pb-6" onSubmit={onSubmit}>
            <FormInput
              form={form}
              label="Name"
              name="name"
              placeholder="My Gemini key"
            />

            <FormSelect
              form={form}
              label={"Provider"}
              name={"provider"}
              selectData={API_PROVIDERS}
            />

            <FormInput
              form={form}
              label="API key"
              name="key"
              placeholder="Paste your API key"
              type="password"
            />

            <FormInput
              form={form}
              label="Model (optional)"
              name="model"
              placeholder="e.g. gemini-2.0-flash"
            />

            <div className="flex justify-between align-center">
              <div className="flex-1">
                <FormCheckbox
                  form={form}
                  label="Set as active"
                  name="isActive"
                />
              </div>

              <div className="flex items-center gap-2">
                <DrawLogClose
                  onClick={resetForm}
                  render={<Button variant="outline">Cancel</Button>}
                />

                <AsyncButton isLoading={isLoading} type="submit">
                  Save
                </AsyncButton>
              </div>
            </div>
          </form>
          <ProviderInfoCard provider={form.watch("provider")} />
        </div>
      </DrawLogContent>
    </FormDrawLogAlert>
  );
};
