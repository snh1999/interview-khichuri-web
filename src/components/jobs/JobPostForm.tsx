import { SparkleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  type IJob,
  type IJobExtractionResult,
  useExtractJob,
} from "@/api/jobs";
import { AiDialog } from "@/components/common/ai/AiDialog";
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
  DrawLog,
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog.tsx";
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

  const { form, isPending, onSubmit } = useJobPostForm({
    job,
    open,
    initialDescription,
    onSuccess,
  });

  const description = form.watch("description");
  const links = form.watch("links");
  const hasContent = description?.trim().length > 0;
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const openAiDialog = () => setAiDialogOpen(true);
  const closeAiDialog = () => setAiDialogOpen(false);

  const handleExtract = async (provider: string, model?: string) => {
    try {
      const result = stripNulls(
        await extractJob.mutateAsync({
          description,
          links: links
            ?.map((l) => l.value)
            .filter(Boolean)
            .join("\n"),
          provider,
          model,
        })
      ) as IJobExtractionResult;

      form.reset({
        ...form.getValues(),
        ...result,
        companyName: result.companyName ?? "",
        deadline: stringToDate(result.deadline) ?? form.getValues("deadline"),
        interviewDate:
          stringToDate(result.interviewDate) ?? form.getValues("interviewDate"),
        status: result.status ?? form.getValues("status"),
      });
    } finally {
      closeAiDialog();
    }
  };

  return (
    <>
      <DrawLog onOpenChange={onOpenChange} open={open}>
        <DrawLogContent>
          <DrawLogHeader>
            <DrawLogTitle>{job ? "Edit Job" : "Add Job"}</DrawLogTitle>
          </DrawLogHeader>

          <form onSubmit={onSubmit}>
            <DrawLogBody>
              {/* TODO: expand or use markdown editor here */}
              <FormInput
                EndComponent={
                  hasContent ? (
                    <span className="flex w-full justify-end">
                      <Button
                        onClick={openAiDialog}
                        size="sm"
                        variant="outline"
                      >
                        <SparkleIcon className="size-4" />
                        AI Extract
                      </Button>
                    </span>
                  ) : null
                }
                form={form}
                label="Description"
                name="description"
                placeholder="Paste the job description here..."
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

              <FormInput
                form={form}
                label="Company"
                name="companyName"
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

              <FormInput
                form={form}
                label="Notes"
                name="notes"
                placeholder="Additional notes..."
                textArea
              />
            </DrawLogBody>

            <DrawLogFooter>
              <DrawLogClose
                render={<Button variant="outline">Cancel</Button>}
              />
              <AsyncButton
                disabled={!form.formState.isDirty}
                isLoading={isPending}
                type="submit"
              >
                {job ? "Update" : "Create"}
              </AsyncButton>
            </DrawLogFooter>
          </form>
        </DrawLogContent>
      </DrawLog>

      <AiDialog
        description="Choose an AI provider to extract job details from the description and links."
        executeLabel="Extract"
        isLoading={extractJob.isPending}
        onExecute={handleExtract}
        onOpenChange={setAiDialogOpen}
        open={aiDialogOpen}
        title="Extract Job Details"
      />
    </>
  );
};
