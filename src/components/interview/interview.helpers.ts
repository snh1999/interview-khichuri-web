import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import type { DefaultValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import {
  type IInterviewQuestion,
  useCreateInterview,
  useSetLocalInterviewState,
} from "@/api/sessions/interviews.ts";
import { INTERVIEW_PAGE } from "@/app.constants.ts";
import type { ICreateInterviewDialogProps } from "@/components/interview/CreateInterviewDialog.tsx";

const FOCUS_TYPE_ENUM = z.enum([
  "prepsession",
  "resume",
  "job_description",
  "company",
  "topics",
  "question_bank",
]);

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const createInterviewSchema = z.object({
  mode: z.enum(["qa_flow", "interview_flow"]),
  focusTypes: z.array(FOCUS_TYPE_ENUM),
  topicNames: z.array(z.string().trim().min(1)),
  questionCount: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().min(1).max(50).optional()
  ),
  maxDurationMinutes: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().min(1).max(180).optional()
  ),
});

type FormInput = z.input<typeof createInterviewSchema>;
type FormOutput = z.infer<typeof createInterviewSchema>;

export interface IInterviewFormHook {
  // biome-ignore lint/suspicious/noExplicitAny: <>
  form: UseFormReturn<FormInput, any, FormOutput>;
  isLoading: boolean;
  onSubmit: (provider: string, model?: string) => Promise<void>;
}

const buildDefaultValues = (): DefaultValues<FormInput> => ({
  mode: "qa_flow",
  focusTypes: [],
  topicNames: [],
  questionCount: undefined,
  maxDurationMinutes: undefined,
});

export const useCreateInterviewForm = ({
  open,
  onOpenChange,
  session,
}: ICreateInterviewDialogProps): IInterviewFormHook => {
  const navigate = useNavigate();
  const createInterview = useCreateInterview();
  const saveLocalDraft = useSetLocalInterviewState();

  // biome-ignore lint/suspicious/noExplicitAny: <>
  const form = useForm<FormInput, any, FormOutput>({
    defaultValues: buildDefaultValues(),
    resolver: zodResolver(createInterviewSchema),
  });

  useEffect(() => {
    if (open) {
      return;
    }
    form.reset(buildDefaultValues());
  }, [open, form]);

  const onSubmit = async (provider: string, model?: string) => {
    await form.handleSubmit(async (data) => {
      try {
        const created = await createInterview.mutateAsync({
          ...data,
          sessionId: session.id,
          provider,
          model: model?.trim() || undefined,
        });

        const questions: IInterviewQuestion[] = created.questions.map(
          (q, i) => ({
            ...q,
            questionText: q.questionText || `Question ${i + 1}`,
          })
        );

        await saveLocalDraft.mutateAsync({
          interviewId: created.interview.id,
          startedAt: Date.now(),
          currentIndex: 0,
          questions,
          items: [],
          sessionId: session.id,
          provider,
          model: model?.trim() || undefined,
          mode: data.mode,
        });

        toast.success("Mock interview started");
        onOpenChange(false);
        navigate(
          generatePath(INTERVIEW_PAGE, {
            interviewId: created.interview.id,
          })
        );
      } catch {
        toast.error("Failed to start mock interview");
      }
    })();
  };

  return { form, isLoading: createInterview.isPending, onSubmit };
};
