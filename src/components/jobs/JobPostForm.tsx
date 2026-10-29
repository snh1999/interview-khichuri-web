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
  CURRENCIES,
  REMOTE_PREFERENCES,
} from "@/components/job-profile/profile.data.ts";
import { useJobPostForm } from "@/components/jobs/JobPostForm.helpers.ts";
import {
  parseJobLinks,
  STATUS_OPTIONS,
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
    form.clearErrors("companyName");
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

    const { links: extractedLinks, ...extracted } = result;
    const parsedLinks = parseJobLinks(extractedLinks);

    form.setValues(
      {
        ...extracted,
        ...(parsedLinks.length > 0
          ? {
              links: parsedLinks.map(({ url, label }) => ({
                value: url,
                label,
              })),
            }
          : {}),
        companyName: result.companyName ?? "",
        roleId: result.roleId ?? null,
        topicNames: result.topicNames ?? [],
        deadline: stringToDate(result.deadline),
      },
      { shouldDirty: true }
    );
  };

  return (
    <FormDrawLogAlert
      isDirty={form.formState.isDirty}
      isEdit={Boolean(job)}
      isLoading={isLoading}
      onOpenChange={onOpenChange}
      open={open}
      type="job"
    >
      <DrawLogContent className="sm:max-w-2xl">
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

            <FormInput
              form={form}
              label="Source URL"
              name="url"
              placeholder="e.g. https://company.com/careers/job-123"
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
              error={form.formState.errors.companyName?.message}
              onChange={handleCompanyChange}
              placeholder="e.g. Acme Corp"
            />

            <RolesCombobox
              disabled={Boolean(job)}
              form={form}
              label="Role"
              name="roleId"
            />

            <TopicsCombobox form={form} idsName="topicIds" names="topicNames" />
            <div className="flex items-center gap-2">
              <FormInput
                form={form}
                label="Location"
                name="location"
                placeholder="e.g. Remote, New York, NY"
              />

              <FormSelect
                form={form}
                label="Work Type"
                name="workType"
                placeholder="Select work type"
                selectData={REMOTE_PREFERENCES}
              />

              <FormInput
                form={form}
                label="Experience Requirement"
                name="experienceRequired"
                placeholder="Years of experience"
                type="number"
              />
            </div>

            <div className="flex gap-2">
              <FormInput
                form={form}
                label="Minimum Salary"
                name="salaryLower"
                placeholder="e.g. 120000"
                type="number"
              />

              <FormInput
                form={form}
                label="Maximum Salary"
                name="salaryUpper"
                placeholder="e.g. 150000"
                type="number"
              />

              <FormSelect
                form={form}
                label="Salary Currency"
                name="currency"
                placeholder={"Currency unit of the salary range"}
                selectData={CURRENCIES}
              />
            </div>

            <div className="flex gap-2">
              <FormDatePicker
                form={form}
                label="Deadline"
                name="deadline"
                placeholder="Pick a deadline date..."
              />
              <FormSelect
                form={form}
                label="Status"
                name="status"
                placeholder="Pick a status..."
                selectData={STATUS_OPTIONS}
              />
            </div>
            <div className="flex gap-2">
              <FormDatePicker
                form={form}
                label="Applied At"
                name="appliedAt"
                placeholder="Pick application date..."
              />

              <FormDatePicker
                form={form}
                label="Interview Date"
                name="interviewDate"
                placeholder="Pick an interview date..."
              />
            </div>

            <FormInput
              form={form}
              label="Notes"
              name="notes"
              placeholder="Additional notes..."
              textArea
            />

            <FormArrayInput
              form={form}
              label="Links"
              name="links"
              placeholder="https://example.com/job"
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
  );
};
