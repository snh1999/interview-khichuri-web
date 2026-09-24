import { SparkleIcon } from "@phosphor-icons/react";
import {
  type IJob,
  type IJobExtractionResult,
  useExtractJob,
} from "@/api/jobs";
import { AiActionButton } from "@/components/common/ai/AiActionButton";
import { CompaniesCombobox } from "@/components/common/form/combobox/CompaniesCombobox.tsx";
import { RolesCombobox } from "@/components/common/form/combobox/RolesCombobox.tsx";
import { TopicsCombobox } from "@/components/common/form/combobox/TopicsCombobox.tsx";
import { FormArrayInput } from "@/components/common/form/FormArrayInput.tsx";
import { FormDatePicker } from "@/components/common/form/FormDatePicker";
import { FormInput } from "@/components/common/form/FormInput";
import FormSelect from "@/components/common/form/FormSelect";
import {
  STATUS_OPTIONS,
  useJobPostForm,
} from "@/components/jobs/jobs.helpers.ts";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/ui/button/AsyncButton";
import {
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog.tsx";
import { FormDrawLogAlert } from "@/components/ui/custom/FormDrawLogAlert.tsx";
import { stringToDate, stripNulls } from "@/lib/utils.ts";

interface IProps {
  job?: IJob;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  showTrigger?: boolean;
  initialDescription?: string;
}

export const JobPostForm = ({
  job,
  onSuccess,
  initialDescription,
  onOpenChange,
  open,
}: IProps) => {
  const extractJob = useExtractJob();

  const { form, isLoading, onSubmit } = useJobPostForm({
    job,
    open,
    initialDescription,
    onSuccess,
  });

  const description = form.watch("description");
  const links = form.watch("links");
  const hasExtractContent =
    (description?.trim().length ?? 0) > 0 ||
    (links?.some((link) => link.value.trim().length > 0) ?? false);

  const handleCompanyChange = (id: number | null, name: string) => {
    form.setValue("companyId", id, { shouldDirty: true });
    form.setValue("companyName", name, { shouldDirty: true });
  };

  const handleExtract = async (provider: string, model?: string) => {
    const joinedLinks = links
      ?.map((l) => l.value)
      .filter(Boolean)
      .join("\n");
    const result = stripNulls(
      await extractJob.mutateAsync({
        description,
        ...(joinedLinks ? { links: joinedLinks } : {}),
        provider,
        model,
      })
    ) as IJobExtractionResult;

    form.setValues(
      {
        ...result,
        companyName: result.companyName ?? "",
        deadline: stringToDate(result.deadline),
        interviewDate: stringToDate(result.interviewDate),
      },
      { shouldDirty: true }
    );
  };

  return (
    // TODO-remove div later
    <div>
      <FormDrawLogAlert
        isDirty={form.formState.isDirty}
        isEdit={Boolean(job)}
        isLoading={isLoading}
        onOpenChange={onOpenChange}
        open={open}
        type="job"
      >
        <DrawLogContent>
          <DrawLogHeader>
            <DrawLogTitle>{job ? "Edit Job" : "Add Job"}</DrawLogTitle>
          </DrawLogHeader>

          <form onSubmit={onSubmit}>
            <DrawLogBody>
              <FormInput
                form={form}
                label="Description"
                name="description"
                placeholder="Paste the job description here..."
                rows={8}
                textArea
              />

              <FormArrayInput
                form={form}
                label="Links"
                name="links"
                placeholder="https://example.com/job"
              />

              <FormInput
                form={form}
                label="Title"
                name="title"
                placeholder="e.g. Senior Frontend Engineer"
              />

              <CompaniesCombobox
                companyId={form.watch("companyId") ?? null}
                companyName={form.watch("companyName") ?? ""}
                onChange={handleCompanyChange}
                placeholder="e.g. Acme Corp"
              />

              <RolesCombobox
                disabled={Boolean(job)}
                form={form}
                label="Role"
                name="roleId"
              />

              <TopicsCombobox
                form={form}
                idsName="topicIds"
                names="topicNames"
              />

              <FormInput
                form={form}
                label="Location"
                name="location"
                placeholder="e.g. Remote, New York, NY"
              />

              <FormInput
                form={form}
                label="Source"
                name="source"
                placeholder="e.g. LinkedIn, Company website or link"
              />

              <FormSelect
                form={form}
                label="Status"
                name="status"
                selectData={STATUS_OPTIONS}
              />

              <FormDatePicker
                form={form}
                label="Deadline"
                name="deadline"
                placeholder="Pick a deadline date..."
              />

              <FormDatePicker
                form={form}
                label="Interview Date"
                name="interviewDate"
                placeholder="Pick an interview date..."
              />

              <FormDatePicker
                form={form}
                label="Applied At"
                name="appliedAt"
                placeholder="Pick application date..."
              />

              <FormInput
                form={form}
                label="Notes"
                name="notes"
                placeholder="Additional notes..."
                textArea
              />
            </DrawLogBody>

            <DrawLogFooter className="justify-between!">
              <AiActionButton
                description="Choose an AI provider to extract job details from the description and links."
                disabled={!hasExtractContent}
                execute={handleExtract}
                executeLabel="AI Extract"
                hideTarget
                icon={<SparkleIcon className="size-4" />}
                isLoading={extractJob.isPending}
                title="Extract Job Details"
                toastErrorMessage="Failed to extract job details"
                toastSuccessMessage="Job details extracted"
                variant="outline"
              />

              <div className="flex items-center gap-2">
                <DrawLogClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <AsyncButton
                  disabled={!form.formState.isDirty}
                  isLoading={isLoading}
                  type="submit"
                >
                  {job ? "Update" : "Create"}
                </AsyncButton>
              </div>
            </DrawLogFooter>
          </form>
        </DrawLogContent>
      </FormDrawLogAlert>
    </div>
  );
};
