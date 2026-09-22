import { NotePencilIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import type { INote } from "@/api/notes";
import { FormCombobox } from "@/components/common/form/combobox/FormCombobox.tsx";
import { JobsCombobox } from "@/components/common/form/combobox/JobsCombobox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { FormMarkdownInput } from "@/components/common/form/FormMarkdownInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import {
  buildQuestionBankTemplate,
  JOB_TEMPLATE_TEXT,
} from "@/components/notes/notes.helpers";
import {
  type INotePreset,
  NOTE_LINK_TYPE_OPTIONS,
  noteFormDefaults,
  useNoteForm,
} from "@/components/notes/notes.helpers.ts";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
  DrawLogTrigger,
} from "@/components/ui/custom/DrawLog.tsx";
import { FormDrawLogAlert } from "@/components/ui/custom/FormDrawLogAlert.tsx";
import {
  getQuestionBankItem,
  type IQuestionBankItem,
  QUESTION_BANK,
} from "@/lib/questions/question-bank.ts";

interface IProps {
  note?: INote;
  preset?: INotePreset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showTrigger?: boolean;
}

const questionToOption = (item: IQuestionBankItem) => ({
  label: item.questions[0],
  value: item.id,
});

export const NoteFormDialog = ({
  note,
  preset,
  open,
  onOpenChange,
  showTrigger,
}: IProps) => {
  const { form, onSubmit, isLoading } = useNoteForm(note, () =>
    onOpenChange(false)
  );

  const isEditing = Boolean(note);
  const noteType = form.watch("noteType");
  const questionBankId = form.watch("questionBankId");
  const lastBankTitleRef = useRef<string>("");

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(noteFormDefaults(note, preset));
  }, [form, note, open, preset]);

  useEffect(() => {
    if (!open || note) {
      return;
    }
    if (noteType === "job") {
      form.setValue("details", JOB_TEMPLATE_TEXT, {
        shouldDirty: false,
        shouldValidate: false,
      });
      return;
    }
    if (noteType === "question_bank") {
      const item = getQuestionBankItem(questionBankId) ?? QUESTION_BANK[0];
      if (!item) {
        return;
      }
      form.setValue("questionBankId", item.id, {
        shouldDirty: false,
        shouldValidate: false,
      });
      form.setValue("details", buildQuestionBankTemplate(item), {
        shouldDirty: false,
        shouldValidate: false,
      });
      const currentTitle = (form.getValues("title") ?? "").trim();
      if (!currentTitle || currentTitle === lastBankTitleRef.current) {
        form.setValue("title", item.questions[0], {
          shouldDirty: false,
          shouldValidate: false,
        });
      }
      lastBankTitleRef.current = item.questions[0];
      return;
    }
    form.setValue("details", "", {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [form, note, noteType, open, questionBankId]);

  return (
    <FormDrawLogAlert
      isDirty={form.formState.isDirty}
      isEdit={Boolean(note)}
      isLoading={isLoading}
      onOpenChange={onOpenChange}
      open={open}
      type="note"
    >
      {showTrigger ? (
        <DrawLogTrigger
          render={
            <Button variant="outline">
              <PlusCircleIcon />
              New Note
            </Button>
          }
        />
      ) : null}

      <DrawLogContent className="sm:w-[90vw] sm:max-w-[90vw]">
        <DrawLogHeader>
          <DrawLogTitle className="flex items-center gap-2">
            <NotePencilIcon />
            {note ? "Edit Note" : "Create Note"}
          </DrawLogTitle>
        </DrawLogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <DrawLogBody>
            <FormInput
              form={form}
              label="Title"
              name="title"
              placeholder="Enter a title for your note"
            />

            {note ? null : (
              <div className="flex gap-2">
                <FormSelect
                  form={form}
                  label="Type"
                  name="noteType"
                  placeholder="Select a type"
                  selectData={NOTE_LINK_TYPE_OPTIONS}
                />

                {noteType === "job" ? (
                  <JobsCombobox
                    form={form}
                    label="Linked Job"
                    name="jobId"
                    placeholder="Select a job"
                  />
                ) : null}

                {noteType === "question_bank" ? (
                  <FormCombobox
                    data={QUESTION_BANK}
                    form={form}
                    label="Question"
                    name="questionBankId"
                    placeholder="Select a question"
                    toOption={questionToOption}
                  />
                ) : null}
              </div>
            )}

            <FormMarkdownInput
              form={form}
              height={note ? "60vh" : "50vh"}
              label="Details (Markdown)"
              name="details"
              placeholder="Write your note in markdown"
            />
          </DrawLogBody>

          <DrawLogFooter>
            <DrawLogClose render={<Button variant="outline">Cancel</Button>} />
            <AsyncButton isLoading={isLoading} type="submit">
              {isEditing ? "Update" : "Create"}
            </AsyncButton>
          </DrawLogFooter>
        </form>
      </DrawLogContent>
    </FormDrawLogAlert>
  );
};
