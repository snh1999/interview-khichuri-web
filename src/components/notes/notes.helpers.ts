import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  type ICreateNoteDto,
  type INote,
  useCreateNote,
  useUpdateNote,
} from "@/api/notes";
import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const NOTE_LINK_TYPES = ["job", "question_bank"] as const;
export type TNoteLinkType = (typeof NOTE_LINK_TYPES)[number];
export type TNoteFormType = TNoteLinkType | "none";

export const NOTE_LINK_TYPE_OPTIONS: {
  value: TNoteFormType;
  label: string;
}[] = [
  { value: "none", label: "None" },
  { value: "job", label: "Job" },
  { value: "question_bank", label: "Question Bank" },
];

export interface INotePreset {
  noteType?: TNoteLinkType;
  questionBankId?: string;
}

const noteFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(127),
    details: z
      .string()
      .trim()
      .min(1, "Details are required")
      .max(5000, "Details are too long"),
    noteType: z.enum(["none", ...NOTE_LINK_TYPES]),
    jobId: z.string().uuid().nullish(),
    questionBankId: z.string().nullish(),
  })
  .refine((data) => data.noteType !== "job" || Boolean(data.jobId), {
    message: "Please select a job",
    path: ["jobId"],
  });

export type NoteFormData = z.infer<typeof noteFormSchema>;

export const noteFormDefaults = (
  initialValues?: INote,
  preset?: INotePreset
): NoteFormData => ({
  title: initialValues?.title ?? "",
  details: initialValues?.details ?? "",
  noteType: initialValues ? "none" : (preset?.noteType ?? "none"),
  jobId: initialValues?.jobId ?? null,
  questionBankId: initialValues ? null : (preset?.questionBankId ?? null),
});

const toCreatePayload = (data: NoteFormData): ICreateNoteDto => ({
  title: data.title,
  details: data.details,
  questionId: null,
  jobId: data.noteType === "job" ? data.jobId : null,
});

export const useNoteForm = (initialValues?: INote, onSuccess?: () => void) => {
  const form = useForm<NoteFormData>({
    defaultValues: noteFormDefaults(initialValues),
    resolver: zodResolver(noteFormSchema),
  });

  const { mutateAsync: createNote } = useCreateNote();
  const { mutateAsync: updateNote } = useUpdateNote();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (initialValues) {
        await updateNote({
          id: initialValues.id,
          title: data.title,
          details: data.details,
        });
        toast.success("Note updated");
      } else {
        await createNote(toCreatePayload(data));
        toast.success("Note created");
      }
      onSuccess?.();
    } catch {
      toast.error("Failed to save note");
    }
  });

  return {
    form,
    isEditing: Boolean(initialValues),
    isPending: form.formState.isSubmitting,
    onSubmit,
  };
};

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
    new Date(value)
  );

export const JOB_TEMPLATE_TEXT = "";

export const buildQuestionContextTemplate = (
  questionText: string,
  answer?: string | null
): string =>
  [
    "## Context",
    "",
    answer
      ? `**Question:** ${questionText}\n\n**Your answer:** ${answer}`
      : `**Question:** ${questionText}`,
  ].join("\n");

export const buildQuestionBankTemplate = (item: IQuestionBankItem): string =>
  [
    "## Other ways this question is asked",
    "",
    ...item.questions.slice(1).map((question) => `- ${question}`),
    "",
    "## Suggestions for your answer",
    "",
    item.suggestions,
  ].join("\n");
