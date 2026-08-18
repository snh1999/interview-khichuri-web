import { PencilLineIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useJob } from "@/api/jobs";
import type { IPrepSession } from "@/api/sessions";
import { JobsCombobox } from "@/components/common/form/combobox/JobsCombobox.tsx";
import { RolesCombobox } from "@/components/common/form/combobox/RolesCombobox.tsx";
import { TopicsCombobox } from "@/components/common/form/combobox/TopicsCombobox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import {
  EXPERIENCE_OPTIONS,
  type TCreateSessionFormData,
  useCreateSessionForm,
} from "@/components/prep-session/session/session.helpers.ts";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DrawLog,
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
  DrawLogTrigger,
} from "@/components/ui/custom/DrawLog.tsx";

interface IProps {
  session?: IPrepSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  viewTrigger?: boolean;
}

const JobPrefillEffect = ({
  jobId,
  form,
}: {
  jobId: string;
  form: UseFormReturn<TCreateSessionFormData>;
}) => {
  const { data: job } = useJob(jobId);
  const prefilledJobId = useRef<string | null>(null);

  useEffect(() => {
    if (prefilledJobId.current === jobId || !job) {
      return;
    }
    prefilledJobId.current = jobId;

    const currentTopicIds = form.getValues("topicIds") ?? [];
    const currentTopicNames = form.getValues("topicNames") ?? [];
    const hasExistingTopics =
      currentTopicIds.length > 0 || currentTopicNames.length > 0;

    if (!hasExistingTopics && job.topicIds?.length) {
      form.setValue("topicIds", job.topicIds, { shouldDirty: true });
    }

    form.setValue("roleId", job.roleId, { shouldDirty: true });
  }, [jobId, job, form]);

  return null;
};

export const PrepSessionForm = ({
  session,
  open,
  onOpenChange,
  onSuccess,
  viewTrigger,
}: Readonly<IProps>) => {
  const { form, isLoading, onSubmit } = useCreateSessionForm({
    open,
    session,
    onSuccess,
  });

  const selectedJobId = form.watch("jobId");

  return (
    <DrawLog onOpenChange={onOpenChange} open={open}>
      {viewTrigger ? (
        <DrawLogTrigger
          render={
            <Button size="sm" type="button" variant="outline">
              {session ? (
                <>
                  <PencilLineIcon className="size-3" />
                  Edit
                </>
              ) : (
                <>
                  <PlusCircleIcon className="size-3" weight="bold" />
                  New Session
                </>
              )}
            </Button>
          }
        />
      ) : null}
      <DrawLogContent>
        <DrawLogHeader>
          <DrawLogTitle>
            {session ? "Edit Session" : "New Preparation Session"}
          </DrawLogTitle>
        </DrawLogHeader>

        <form onSubmit={onSubmit}>
          <DrawLogBody>
            <FormInput
              form={form}
              label="Title"
              name="title"
              placeholder="e.g. React Hooks Deep Dive"
            />

            <FormInput
              form={form}
              label="Description"
              name="description"
              placeholder="e.g. Frontend interview prep for Senior React role"
              textArea
            />

            {session ? null : (
              <JobsCombobox
                description="You can not update this once session is created"
                form={form}
                label="Job"
                name="jobId"
              />
            )}

            <FormSelect
              form={form}
              label="Experience Level"
              name="experience"
              placeholder="Select experience level..."
              selectData={EXPERIENCE_OPTIONS}
            />

            <RolesCombobox
              description={selectedJobId ? "Filled from job" : ""}
              disabled={Boolean(selectedJobId)}
              form={form}
              label="Target Role"
              name="roleId"
            />

            <TopicsCombobox
              form={form}
              idsName={"topicIds"}
              names={"topicNames"}
            />
          </DrawLogBody>

          <DrawLogFooter>
            <DrawLogClose render={<Button variant="outline">Cancel</Button>} />
            <AsyncButton
              disabled={!form.formState.isDirty}
              isLoading={isLoading}
              type="submit"
            >
              {session ? "Update" : "Create"}
            </AsyncButton>
          </DrawLogFooter>
        </form>
      </DrawLogContent>

      {selectedJobId && !session ? (
        <JobPrefillEffect form={form} jobId={selectedJobId} />
      ) : null}
    </DrawLog>
  );
};
