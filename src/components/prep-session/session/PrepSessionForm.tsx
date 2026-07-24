import { PencilLineIcon, PlusCircleIcon } from "@phosphor-icons/react";
import type { IPrepSession } from "@/api/sessions";
import { RolesCombobox } from "@/components/common/form/combobox/RolesCombobox.tsx";
import { TopicsCombobox } from "@/components/common/form/combobox/TopicsCombobox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import {
  EXPERIENCE_OPTIONS,
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

export const PrepSessionForm = ({
  session,
  open,
  onOpenChange,
  onSuccess,
  viewTrigger,
}: Readonly<IProps>) => {
  // TODO: add job field (select)
  // TODO: if job present- keep role and topics empty
  // TODO: if job is not present- make role and topics mandatory
  // TODO:
  // TODO:
  // TODO: make a reusable topicId and topicNames pattern in backend and fe (types and code)
  const { form, isLoading, onSubmit } = useCreateSessionForm({
    session,
    onSuccess,
  });

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

            <FormSelect
              form={form}
              label="Experience Level"
              name="experience"
              placeholder="Select experience level..."
              selectData={EXPERIENCE_OPTIONS}
            />

            <RolesCombobox form={form} label="Target Role" name="roleId" />

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
    </DrawLog>
  );
};
