import { zodResolver } from "@hookform/resolvers/zod";
import type { BaseSyntheticEvent } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import {
  type IPrepSession,
  useCreateSession,
  useUpdateSession,
} from "@/api/sessions";
import {
  DEFAULT_MAX_STRING_LENGTH,
  MAX_SHORT_LENGTH,
  MAX_TINY_LENGTH,
  SESSION_DETAIL_PAGE,
} from "@/app.constants.ts";
import { useResolveLookupField } from "@/hooks/useResolveLookupField.ts";

const createSessionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(DEFAULT_MAX_STRING_LENGTH),
  experience: z.string().nullish(),
  jobId: z.uuid().nullish(),
  roleId: z.number().int().positive().nullish(),
  title: z.string().trim().min(1, "Title is required").max(MAX_SHORT_LENGTH),
  topicIds: z.array(z.number().int().positive()).nullish(),
  topicNames: z.array(z.string().trim().min(1).max(MAX_TINY_LENGTH)).nullish(),
});

export type TCreateSessionFormData = z.infer<typeof createSessionSchema>;

export interface TFormHook<T extends Record<string, unknown>> {
  isLoading: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  form: UseFormReturn<T>;
}

const EXPERIENCE_OPTIONS = [
  { label: "Junior", value: "junior" },
  { label: "Mid-level", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Lead / Principal", value: "lead" },
] as const;

export { EXPERIENCE_OPTIONS };

interface IProps {
  session?: IPrepSession;
  onSuccess?: () => void;
}

export const useCreateSessionForm = ({
  session,
  onSuccess,
}: IProps): TFormHook<TCreateSessionFormData> => {
  const navigateToPage = useNavigateToSessionPage();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();

  const form = useForm<TCreateSessionFormData>({
    defaultValues: {
      ...session,
      title: session?.title ?? "",
      description: session?.description ?? "",
    },
    resolver: zodResolver(createSessionSchema),
  });

  const resolveTopics = useResolveLookupField(form, "topics");

  const onSubmit = form.handleSubmit(async (data) => {
    const { topicNames, ...rest } = data;
    const topicIds = await resolveTopics("topicIds", "topicNames");
    const payload = {
      ...rest,
      ...(topicIds ? { topicIds } : {}),
    };

    try {
      let newSessionId: string;
      if (session) {
        newSessionId = (
          await updateSession.mutateAsync({ id: session.id, ...payload })
        ).id;
        toast.success("Session updated");
      } else {
        newSessionId = (await createSession.mutateAsync(payload)).id;
        toast.success("Session created");
      }

      onSuccess?.();
      navigateToPage(newSessionId);
    } catch {
      toast.error("Failed to create session");
    }
  });

  return { form, isLoading: createSession.isPending, onSubmit };
};

export const useNavigateToSessionPage = () => {
  const navigate = useNavigate();
  return (id: string) => {
    navigate(SESSION_DETAIL_PAGE.replace(":sessionId", id));
  };
};
