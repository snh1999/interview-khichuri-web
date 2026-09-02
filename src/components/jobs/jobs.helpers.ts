import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  type ICreateJobDto,
  type IJob,
  JOB_STATUS,
  type TJobStatus,
  useCreateJob,
  useUpdateJob,
} from "@/api/jobs";
import {
  DEFAULT_MAX_STRING_LENGTH,
  MAX_SHORT_LENGTH,
  MAX_TINY_LENGTH,
  MAX_URL_LENGTH,
} from "@/app.constants.ts";
import { useResolveLookupField } from "@/hooks/useResolveLookupField.ts";
import { stringToDate, stripNulls } from "@/lib/utils.ts";

export const STATUS_OPTIONS: { value: TJobStatus; label: string }[] = [
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" },
  { label: "Scheduled", value: "scheduled" },
] as const;

export const JOB_STATUS_BADGE_CLASS: Record<TJobStatus, string> = {
  saved: "bg-secondary text-secondary-foreground",
  applied: "bg-blue-100 text-blue-700",
  scheduled: "bg-emerald-100 text-emerald-700",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getDaysUntilDeadline = (
  deadline?: string | null
): number | null => {
  if (!deadline) {
    return null;
  }
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / MS_PER_DAY);
};

const jobPostSchema = z.object({
  appliedAt: z.date().nullish(),
  companyId: z.number().int().positive().nullish(),
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(MAX_SHORT_LENGTH),
  deadline: z.date().nullish(),
  description: z
    .string()
    .trim()
    .min(10, "Description too short")
    .max(DEFAULT_MAX_STRING_LENGTH),
  interviewDate: z.date().nullish(),
  links: z.array(z.object({ value: z.url().max(MAX_URL_LENGTH) })).nullish(),
  location: z.string().max(MAX_SHORT_LENGTH).nullish(),
  notes: z.string().max(DEFAULT_MAX_STRING_LENGTH).nullish(),
  roleId: z.number().int().positive().nullish(),
  source: z.string().max(DEFAULT_MAX_STRING_LENGTH).nullish(),
  status: z.enum(JOB_STATUS),
  title: z
    .string()
    .trim()
    .min(2, "Title too short")
    .max(50, "Keep the title less than 50 characters"),
  topicIds: z.array(z.number().int().positive()),
  topicNames: z.array(z.string().trim().min(1).max(MAX_TINY_LENGTH)).optional(),
});
export default jobPostSchema;

export type TJobFormData = z.infer<typeof jobPostSchema>;

interface IProps {
  job?: IJob;
  open: boolean;
  initialDescription?: string;
  onSuccess?: () => void;
}

const buildDefaultValues = (
  job?: IJob,
  initialDescription?: string
): DefaultValues<TJobFormData> => ({
  ...job,
  appliedAt: stringToDate(job?.appliedAt),
  deadline: stringToDate(job?.deadline),
  description: initialDescription ?? job?.description,
  interviewDate: stringToDate(job?.interviewDate),
  links: job?.links
    ? job.links
        .split("\n")
        .filter(Boolean)
        .map((v) => ({ value: v }))
    : [],
  status: job?.status ?? "saved",
  title: job?.title ?? "",
  topicIds: job?.topicIds ?? [],
});

export const useJobPostForm = ({
  job,
  open,
  initialDescription,
  onSuccess,
}: IProps) => {
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const form = useForm<TJobFormData>({
    defaultValues: buildDefaultValues(job, initialDescription),
    resolver: zodResolver(jobPostSchema),
  });

  const resolveTopics = useResolveLookupField(form, "topics");

  const watchedStatus = form.watch("status");

  // biome-ignore lint/correctness/useExhaustiveDependencies: only auto-set appliedAt when status changes to "applied"
  useEffect(() => {
    if (watchedStatus === "applied" && !form.getValues("appliedAt")) {
      form.setValue("appliedAt", new Date(), { shouldDirty: true });
    }
  }, [watchedStatus]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: job is excluded so background refetches don't wipe the user's edits
  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(buildDefaultValues(job, initialDescription));
  }, [open, initialDescription, form, job?.id]);

  const onSubmit = form.handleSubmit(async (rawData: TJobFormData) => {
    const { links, topicNames, ...data } = rawData;
    const topicIds = await resolveTopics("topicIds", "topicNames");
    const payload = stripNulls({
      ...data,
      ...(topicIds ? { topicIds } : {}),
      links: links
        ? links
            .map((l) => l.value)
            .filter(Boolean)
            .join("\n")
        : "",
    }) as ICreateJobDto;

    try {
      if (job) {
        await updateJob.mutateAsync({ id: job.id, ...payload });
        toast.success("Job updated");
      } else {
        await createJob.mutateAsync(payload);
        toast.success("Job created");
      }
      onSuccess?.();
    } catch {
      toast.error(`Failed to ${job ? "update" : "create"} job`);
    }
  });

  return {
    form,
    onSubmit,
    isPending: createJob.isPending || updateJob.isPending,
  };
};
