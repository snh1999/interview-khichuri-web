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
import type { TFormHook } from "@/components/prep-session/session/session.helpers.ts";
import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";
import { markdownToPlain } from "@/lib/utils.ts";

export const NOTE_LINK_TYPES = ["question_bank"] as const;
export type TNoteLinkType = (typeof NOTE_LINK_TYPES)[number];
export type TNoteFormType = TNoteLinkType | "none";

export const NOTE_LINK_TYPE_OPTIONS: {
  value: TNoteFormType;
  label: string;
}[] = [
  { value: "none", label: "None" },
  { value: "question_bank", label: "Question Bank" },
];

export interface INotePreset {
  noteType?: TNoteLinkType;
  questionBankId?: string;
}

const noteFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(127),
  details: z
    .string()
    .trim()
    .min(1, "Details are required")
    .max(5000, "Details are too long"),
  noteType: z.enum(["none", ...NOTE_LINK_TYPES]),
  questionBankId: z.string().nullish(),
});

export type TNoteFormData = z.infer<typeof noteFormSchema>;

export const noteFormDefaults = (
  initialValues?: INote,
  preset?: INotePreset
): TNoteFormData => ({
  title: initialValues?.title ?? "",
  details: initialValues?.details ?? "",
  noteType: initialValues ? "none" : (preset?.noteType ?? "none"),
  questionBankId: initialValues ? null : (preset?.questionBankId ?? null),
});

const toCreatePayload = (data: TNoteFormData): ICreateNoteDto => ({
  title: data.title,
  details: data.details,
});

export const useNoteForm = (
  initialValues?: INote,
  onSuccess?: () => void
): TFormHook<TNoteFormData> => {
  const form = useForm<TNoteFormData>({
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
    isLoading: form.formState.isSubmitting,
    onSubmit,
  };
};

export const NOTE_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "updated", label: "Recently updated" },
  { value: "title", label: "Title (A-Z)" },
] as const;

export type TNoteSortKey = (typeof NOTE_SORT_OPTIONS)[number]["value"];

export const filterNotes = (
  notes: INote[],
  options: { favoritesOnly: boolean; query: string }
): INote[] => {
  const query = options.query.trim().toLowerCase();
  return notes.filter(
    (note) =>
      (!options.favoritesOnly || note.isFavorite) &&
      (!query ||
        note.title.toLowerCase().includes(query) ||
        (note.details ?? "").toLowerCase().includes(query))
  );
};

const timestamp = (value: string) => new Date(value).getTime();

export const sortNotes = (notes: INote[], sort: TNoteSortKey): INote[] => {
  const direction = sort === "oldest" ? 1 : -1;
  const dateKey = sort === "updated" ? "updatedAt" : "createdAt";

  return [...notes].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    if (sort === "title") {
      return a.title.localeCompare(b.title);
    }
    return (timestamp(a[dateKey]) - timestamp(b[dateKey])) * direction;
  });
};

export const noteDetailsPlain = (
  details?: string | null,
  maxLength = 140
): string => {
  const text = markdownToPlain(details ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > maxLength
    ? `${text.slice(0, maxLength).trimEnd()}…`
    : text;
};

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
