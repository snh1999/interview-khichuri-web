import { useCallback } from "react";
import { useController } from "react-hook-form";
import type { ISessionWithQuestions } from "@/api/sessions";
import {
  FOCUS_TYPE_OPTIONS,
  INTERVIEW_MODE_OPTIONS,
  type TInterviewMode,
} from "@/api/sessions/interviews.ts";
import { AiDialog } from "@/components/common/ai/AiDialog.tsx";
import { TopicsAppCombobox } from "@/components/common/form/combobox/TopicsAppCombobox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { CheckboxGroup, CheckboxGroupItem } from "@/components/ui/checkbox.tsx";
import { Field, FieldLabel } from "@/components/ui/field.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";
import { useCreateInterviewForm } from "./interview.helpers.ts";

export interface ICreateInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: ISessionWithQuestions;
}

export const CreateInterviewDialog = ({
  open,
  onOpenChange,
  session,
}: Readonly<ICreateInterviewDialogProps>) => {
  const { form, isLoading, onSubmit } = useCreateInterviewForm({
    open,
    onOpenChange,
    session,
  });

  const sessionTopicIds = (session.sessionTopics ?? []).map((st) => st.topicId);

  const { field: modeField } = useController({
    control: form.control,
    name: "mode",
  });

  const { field: focusField } = useController({
    control: form.control,
    name: "focusTypes",
  });

  const handleModeChange = useCallback(
    (values: string[]) => modeField.onChange(values[0] as TInterviewMode),
    [modeField]
  );

  const handleTopicChange = useCallback(
    (topicNames: string[]) => form.setValue("topicNames", topicNames),
    [form]
  );

  return (
    <AiDialog
      description="Generate a fresh set of questions for this attempt. Questions are stored locally and scored by AI at the end."
      executeLabel="Start"
      isLoading={isLoading}
      onExecute={onSubmit}
      onOpenChange={onOpenChange}
      open={open}
      title="Start Mock Interview"
    >
      <div className="space-y-6">
        <div className="space-y-2 pt-2">
          <Label>Flow</Label>
          <ToggleGroup
            className="grid w-full grid-cols-2"
            onValueChange={handleModeChange}
            value={[modeField.value as string]}
            variant="outline"
          >
            {INTERVIEW_MODE_OPTIONS.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-muted-foreground text-xs">
            {modeField.value === "qa_flow"
              ? "Answer all questions, then evaluate once at the end."
              : "Conversational: follow-up questions are generated as you go."}
          </p>
        </div>

        <Field>
          <FieldLabel>Question focus</FieldLabel>
          <CheckboxGroup
            onValueChange={focusField.onChange}
            value={focusField.value}
          >
            {FOCUS_TYPE_OPTIONS.map((option) => (
              <CheckboxGroupItem key={option.value} value={option.value}>
                {option.label}
              </CheckboxGroupItem>
            ))}
          </CheckboxGroup>
        </Field>

        <TopicsAppCombobox
          disabled={isLoading}
          key={open ? "open" : "closed"}
          onValueChange={handleTopicChange}
          sessionTopicIds={sessionTopicIds}
        />

        <FormInput
          description="Leave blank for the AI to decide"
          disabled={isLoading}
          form={form}
          label="Number of questions (optional)"
          name="questionCount"
          placeholder="AI default"
          type="number"
        />

        <FormInput
          description="Helps pace the question set for the available time"
          disabled={isLoading}
          form={form}
          label="Expected interview length in minutes (optional)"
          name="maxDurationMinutes"
          placeholder="AI default"
          type="number"
        />
      </div>
    </AiDialog>
  );
};
