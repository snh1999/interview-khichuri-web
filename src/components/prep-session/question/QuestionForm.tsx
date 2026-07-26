import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  type IQuestion,
  useAddQuestion,
  useUpdateQuestion,
} from "@/api/sessions";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";

const questionSchema = z.object({
  questionText: z.string().trim().min(1, "Question text is required"),
  answer: z.string().trim().nullish(),
  notes: z.string().trim().nullish(),
});

type TQuestionFormData = z.infer<typeof questionSchema>;

interface IUseQuestionFormProps {
  question?: IQuestion;
  sessionId: string;
  onSuccess?: () => void;
}

const useQuestionForm = ({
  question,
  sessionId,
  onSuccess,
}: IUseQuestionFormProps) => {
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();

  const form = useForm<TQuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: question?.questionText ?? "",
      answer: question?.answer ?? "",
      notes: question?.notes ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const payload = {
      sessionId,
      ...data,
    };

    try {
      if (question) {
        await updateQuestion.mutateAsync({
          questionId: question.id,
          ...payload,
        });
        toast.success("Question updated");
      } else {
        await addQuestion.mutateAsync({
          ...payload,
          isFavorite: false,
        });
        toast.success("Question added");
      }
      onSuccess?.();
    } catch {
      toast.error(`Failed to ${question ? "update" : "add"} question`);
    }
  });

  return {
    form,
    onSubmit,
    isPending: addQuestion.isPending || updateQuestion.isPending,
  };
};

interface IQuestionFormProps {
  question?: IQuestion;
  sessionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const QuestionForm = ({
  question,
  sessionId,
  onSuccess,
  onCancel,
}: IQuestionFormProps) => {
  const { form, onSubmit, isPending } = useQuestionForm({
    question,
    sessionId,
    onSuccess,
  });

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <FormInput
        form={form}
        label="Question text"
        name="questionText"
        placeholder="Write your question..."
        textArea
      />
      <FormInput
        form={form}
        label="Answer"
        name="answer"
        placeholder="Write your answer..."
        textArea
      />
      <FormInput
        form={form}
        label="Notes"
        name="notes"
        placeholder="Additional notes (optional)..."
        textArea
      />
      <div className="flex items-center gap-2">
        {onCancel ? (
          <Button onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
        ) : null}
        <AsyncButton
          disabled={!form.formState.isDirty}
          isLoading={isPending}
          type="submit"
        >
          {question ? "Update" : "Add"} Question
        </AsyncButton>
      </div>
    </form>
  );
};
