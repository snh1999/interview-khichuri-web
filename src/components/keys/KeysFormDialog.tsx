import { zodResolver } from "@hookform/resolvers/zod";
import { KeyIcon, PlusCircleIcon } from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  ALL_PROVIDERS,
  PROVIDER_LABELS,
  type TApiKeyProvider,
  useCreateApiKey,
} from "@/api/keys";
import {
  MAX_NAME_LENGTH,
  MAX_SHORT_LENGTH,
  MAX_URL_LENGTH,
} from "@/app.constants.ts";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import { ProviderInfoCard } from "@/components/keys/info/ProviderInfoCard.tsx";
import type { TFormHook } from "@/components/prep-session/session/session.helpers.ts";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button, type buttonVariants } from "@/components/ui/button.tsx";
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

const baseUrlSchema = z
  .string()
  .max(MAX_URL_LENGTH)
  .optional()
  .refine(
    (value) => !value || value.startsWith("https://"),
    "Base URL must use HTTPS"
  );

const createKeySchema = z
  .object({
    isActive: z.boolean(),
    key: z.string().min(1, "API key is required").max(MAX_NAME_LENGTH),
    model: z.string().max(MAX_SHORT_LENGTH).optional(),
    name: z.string().min(1, "Name is required").max(MAX_SHORT_LENGTH),
    provider: z.enum(ALL_PROVIDERS),
    baseUrl: baseUrlSchema,
  })
  .superRefine((data, context) => {
    if (
      (data.provider === "cloudflare" || data.provider === "custom") &&
      !data.baseUrl?.trim()
    ) {
      context.addIssue({
        code: "custom",
        message: "Base URL is required for this provider",
        path: ["baseUrl"],
      });
    }
  });

type TCreateKeyFormData = z.infer<typeof createKeySchema>;

const useKeysForm = ({
  onSuccess,
  isActive,
}: {
  onSuccess: () => void;
  isActive: boolean;
}): TFormHook<TCreateKeyFormData> => {
  const { mutateAsync: createKey, isPending: isLoading } = useCreateApiKey();

  const form = useForm<TCreateKeyFormData>({
    defaultValues: {
      baseUrl: "",
      isActive,
      key: "",
      model: "",
      name: "",
      provider: "google",
    },
    resolver: zodResolver(createKeySchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await createKey(
      {
        ...data,
        baseUrl: data.baseUrl?.trim() || undefined,
        model: data.model?.trim() || undefined,
      },
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

export const KeysFormDialog = ({
  label = "Add",
  variant = "outline",
  isActive = false,
  getIsActive,
}: {
  label?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  isActive?: boolean;
  getIsActive?: (type: TApiKeyProvider) => boolean;
}) => {
  const [open, setOpen] = useState(false);
  const closeDialog = () => {
    setOpen(false);
  };

  const { form, onSubmit, isLoading } = useKeysForm({
    onSuccess: closeDialog,
    isActive,
  });

  const provider = form.watch("provider");
  const needsBaseUrl = provider === "custom" || provider === "cloudflare";
  const isActiveDefault = getIsActive?.(provider);
  useEffect(() => {
    if (isActiveDefault === undefined) {
      return;
    }
    form.setValue("isActive", isActiveDefault);
  }, [isActiveDefault, form]);

  useEffect(() => {
    if (!needsBaseUrl) {
      form.setValue("baseUrl", "", { shouldDirty: false });
    }
  }, [form, needsBaseUrl]);

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
          <Button variant={variant}>
            <PlusCircleIcon />
            {label}
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

            {needsBaseUrl ? (
              <FormInput
                form={form}
                label="Base URL"
                name="baseUrl"
                placeholder={
                  provider === "cloudflare"
                    ? "https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/v1"
                    : "https://api.example.com/v1"
                }
              />
            ) : null}

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

            <div className="flex items-center justify-between">
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
          <ProviderInfoCard provider={provider} />
        </div>
      </DrawLogContent>
    </FormDrawLogAlert>
  );
};
