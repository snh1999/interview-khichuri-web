/** biome-ignore-all lint/performance/noJsxPropsBind: field-array handlers need the row index */
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  COMPANY_PROVIDER_OPTIONS,
  type IAdminCompany,
  type ICompanyInput,
  type TCompanyProvider,
  useCreateCompany,
  useUpdateCompany,
} from "@/api/admin/companies";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

const NO_PROVIDER = "none";

interface ICompanyFormData {
  name: string;
  aliases: string;
  careerPageUrl: string;
  provider: string;
  enabled: boolean;
  atsBoardId: string;
  links: { type: string; url: string }[];
  researchDossier: string;
}

interface IProps {
  company: IAdminCompany | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toFormValues = (company?: IAdminCompany | null): ICompanyFormData => ({
  aliases: company?.aliases?.join(", ") ?? "",
  atsBoardId: company?.atsBoardId ?? "",
  careerPageUrl: company?.careerPageUrl ?? "",
  enabled: company?.enabled ?? false,
  links: company?.links ?? [],
  name: company?.name ?? "",
  provider: company?.provider ?? NO_PROVIDER,
  researchDossier: company?.researchDossier
    ? JSON.stringify(company.researchDossier, null, 2)
    : "",
});

const toProvider = (value: string): TCompanyProvider | null =>
  value === NO_PROVIDER ? null : (value as TCompanyProvider);

const toPayload = (data: ICompanyFormData): ICompanyInput => {
  const payload: ICompanyInput = {
    aliases: data.aliases
      .split(",")
      .map((alias) => alias.trim())
      .filter(Boolean),
    atsBoardId: data.atsBoardId.trim() || null,
    careerPageUrl: data.careerPageUrl.trim() || null,
    enabled: data.enabled,
    links: data.links
      .map((link) => ({
        type: link.type.trim() || "other",
        url: link.url.trim(),
      }))
      .filter((link) => link.url),
    name: data.name.trim(),
    provider: toProvider(data.provider),
  };

  const dossier = data.researchDossier.trim();
  payload.researchDossier = dossier ? JSON.parse(dossier) : null;

  return payload;
};

export const CompanyFormDialog = ({ company, open, onOpenChange }: IProps) => (
  <Dialog onOpenChange={onOpenChange} open={open}>
    <DialogContent className="sm:max-w-lg">
      <CompanyForm
        company={company}
        key={company?.id ?? "new"}
        onOpenChange={onOpenChange}
      />
    </DialogContent>
  </Dialog>
);

const CompanyForm = ({
  company,
  onOpenChange,
}: Readonly<{
  company: IAdminCompany | null;
  onOpenChange: (open: boolean) => void;
}>) => {
  const form = useForm<ICompanyFormData>({
    defaultValues: toFormValues(company),
  });
  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control: form.control, name: "links" });
  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isPending = isCreating || isUpdating;
  const name = form.watch("name");

  const handleSubmit = form.handleSubmit((data) => {
    setSubmitError(null);

    let payload: ICompanyInput;
    try {
      payload = toPayload(data);
    } catch {
      setSubmitError("Research dossier must be valid JSON.");
      return;
    }

    const options = {
      onError: (error: Error) => setSubmitError(error.message),
      onSuccess: () => {
        onOpenChange(false);
        toast.success(company ? "Company updated" : "Company created");
      },
    };

    if (company) {
      updateCompany({ id: company.id, ...payload }, options);
    } else {
      createCompany(payload, options);
    }
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{company ? "Edit company" : "New company"}</DialogTitle>
      </DialogHeader>

      <FormInput form={form} label="Name" name="name" />
      <FormInput
        description="Comma-separated"
        form={form}
        label="Aliases"
        name="aliases"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <FormInput form={form} label="Career page URL" name="careerPageUrl" />
        <FormInput form={form} label="Board ID" name="atsBoardId" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormSelect
          form={form}
          label="Provider"
          name="provider"
          selectData={COMPANY_PROVIDER_OPTIONS}
        />
        <div className="flex items-end pb-2">
          <FormCheckbox form={form} label="Enabled" name="enabled" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Links</span>
          <Button
            onClick={() => appendLink({ type: "other", url: "" })}
            size="sm"
            type="button"
            variant="outline"
          >
            <PlusIcon />
            Add link
          </Button>
        </div>
        {linkFields.map((field, index) => (
          <div className="flex items-end gap-2" key={field.id}>
            <div className="w-28">
              <FormInput
                form={form}
                label="Type"
                name={`links.${index}.type`}
              />
            </div>
            <div className="flex-1">
              <FormInput form={form} label="URL" name={`links.${index}.url`} />
            </div>
            <Button
              aria-label={`Remove link ${index + 1}`}
              onClick={() => removeLink(index)}
              size="icon"
              type="button"
              variant="destructive"
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
        {linkFields.length === 0 ? (
          <p className="text-muted-foreground text-xs italic">No links.</p>
        ) : null}
      </div>

      <details>
        <summary className="text-muted-foreground cursor-pointer text-xs">
          Advanced: research dossier
        </summary>
        <div className="mt-2">
          <FormInput
            form={form}
            label="Research dossier (JSON)"
            name="researchDossier"
            rows={6}
            textArea
          />
        </div>
      </details>

      {submitError ? (
        <p className="text-destructive text-xs">{submitError}</p>
      ) : null}

      <DialogFooter>
        <AsyncButton
          disabled={!name.trim()}
          isLoading={isPending}
          type="submit"
        >
          {company ? "Save changes" : "Create"}
        </AsyncButton>
      </DialogFooter>
    </form>
  );
};
