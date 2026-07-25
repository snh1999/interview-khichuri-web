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
import { SESSION_DETAIL_PAGE } from "@/app.constants.ts";

const createSessionSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  experience: z.string().nullish(),
  jobId: z.uuid().nullish(),
  roleId: z.number().int().positive().nullish(),
  topicIds: z.array(z.number().int().positive()).nullish(),
  topicNames: z.array(z.string().trim().min(1)).nullish(),
});

export type TCreateSessionFormData = z.infer<typeof createSessionSchema>;

export interface TFormHook<T extends Record<string, unknown>> {
  isLoading: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  form: UseFormReturn<T>;
}

const EXPERIENCE_OPTIONS = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Principal" },
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
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      ...session,
      title: session?.title ?? "",
      description: session?.description ?? "",
      jobId: session?.jobId ?? null,
      topicIds: [],
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      let newSessionId: string;
      if (session) {
        newSessionId = (
          await updateSession.mutateAsync({ id: session.id, ...data })
        ).id;
        toast.success("Session updated");
      } else {
        newSessionId = (await createSession.mutateAsync(data)).id;
        toast.success("Session created");
      }

      onSuccess?.();
      navigateToPage(newSessionId);
    } catch {
      toast.error("Failed to create session");
    }
  });

  return { form, onSubmit, isLoading: createSession.isPending };
};

export const useNavigateToSessionPage = () => {
  const navigate = useNavigate();
  return (id: string) => {
    navigate(SESSION_DETAIL_PAGE.replace(":sessionId", id));
  };
};
