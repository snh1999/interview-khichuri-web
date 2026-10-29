import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { $RefinementCtx } from "zod/v4/core";
import {
  type ICreateJobDto,
  type IJob,
  JOB_STATUS,
  useCreateJob,
  useUpdateJob,
  useUpdateTrackedJob,
} from "@/api/jobs";
import {
  DEFAULT_MAX_STRING_LENGTH,
  MAX_SHORT_LENGTH,
  MAX_TINY_LENGTH,
  MAX_URL_LENGTH,
} from "@/app.constants.ts";
import { workTypeSchema } from "@/components/job-profile/profile.helpers.ts";
import { parseJobLinks } from "@/components/jobs/jobs.helpers.ts";
import type { TFormHook } from "@/components/prep-session/session/session.helpers.ts";
import { useResolveLookupField } from "@/hooks/useResolveLookupField.ts";
import { isHttpUrl, normalizeHttpUrl, stringToDate } from "@/lib/utils.ts";

export interface IJobLink {
  url: string;
  label: string | null;
}

const transformLink = (value: string, ctx: $RefinementCtx<string>) => {
  if (!value) {
    return value;
  }
  const normalized = normalizeHttpUrl(value);
  if (!normalized) {
    ctx.addIssue({ code: "custom", message: "Enter a valid URL" });
    return z.NEVER;
  }
  return normalized;
};

export const serializeJobLinks = (
  links?: { value: string; label?: string | null }[] | null
): string | null => {
  const items = (links ?? [])
    .map((link) => ({
      url: link.value.trim(),
      label: link.label?.trim() || null,
    }))
    .filter((link) => isHttpUrl(link.url));
  return items.length > 0 ? JSON.stringify(items) : null;
};

export const jobPostSchema = z
  .object({
    appliedAt: z.date().nullish(),
    companyId: z.number().int().positive().nullish(),
    companyName: z
      .string()
      .trim()
      .min(1, "Company name is required")
      .max(MAX_SHORT_LENGTH),
    currency: z.string().length(3).nullish(),
    deadline: z.date().nullish(),
    description: z
      .string()
      .trim()
      .min(10, "Description too short")
      .max(DEFAULT_MAX_STRING_LENGTH),
    experienceRequired: z.number().int().nonnegative().nullish(),
    interviewDate: z.date().nullish(),
    links: z
      .array(
        z.object({
          value: z.string().trim().max(MAX_URL_LENGTH).transform(transformLink),
          label: z.string().max(MAX_SHORT_LENGTH).nullish(),
        })
      )
      .nullish(),
    location: z.string().max(MAX_SHORT_LENGTH).nullish(),
    notes: z.string().max(DEFAULT_MAX_STRING_LENGTH).nullish(),
    roleId: z.number().int().positive().nullish(),
    salaryLower: z.number().int().positive().nullish(),
    salaryUpper: z.number().int().positive().nullish(),
    status: z.enum(JOB_STATUS, "Status is required"),
    title: z
      .string()
      .trim()
      .min(2, "Title too short")
      .max(
        MAX_SHORT_LENGTH,
        `Keep the title less than ${MAX_SHORT_LENGTH} characters`
      ),
    url: z
      .string()
      .trim()
      .max(MAX_URL_LENGTH)
      .transform(transformLink)
      .nullish(),
    topicIds: z.array(z.number().int().positive()),
    topicNames: z
      .array(z.string().trim().min(1).max(MAX_TINY_LENGTH))
      .optional(),
    workType: workTypeSchema.nullish(),
  })
  .superRefine((data, ctx) => {
    if (
      data.deadline &&
      data.interviewDate &&
      data.deadline >= data.interviewDate
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Deadline must be before the interview date",
        path: ["deadline"],
      });
    }
  });
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
  appliedAt: stringToDate(job?.track?.appliedAt),
  companyId: job?.companyId ?? null,
  companyName: job?.companyName ?? "",
  currency: job?.currency ?? null,
  deadline: stringToDate(job?.deadline),
  description: initialDescription ?? job?.description ?? "",
  experienceRequired: job?.experienceRequired ?? null,
  interviewDate: stringToDate(job?.track?.interviewDate),
  links: parseJobLinks(job?.links).map(({ url, label }) => ({
    value: url,
    label,
  })),
  location: job?.location ?? null,
  notes: job?.track?.notes ?? null,
  roleId: job?.roleId ?? null,
  salaryLower: job?.salaryLower ?? null,
  salaryUpper: job?.salaryUpper ?? null,
  status: job?.track?.status ?? "saved",
  title: job?.title ?? "",
  topicIds: job?.topicIds ?? [],
  url: job?.url ?? null,
  workType: job?.workType ?? null,
});

export const useJobPostForm = ({
  job,
  open,
  initialDescription,
  onSuccess,
}: IProps): TFormHook<TJobFormData> => {
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const updateTrack = useUpdateTrackedJob();

  const form = useForm<TJobFormData>({
    defaultValues: buildDefaultValues(job, initialDescription),
    resolver: zodResolver(jobPostSchema),
  });

  const resolveTopics = useResolveLookupField(form, "topics");

  const watchedStatus = form.watch("status");
  const watchedAppliedAt = form.watch("appliedAt");
  const watchedInterviewDate = form.watch("interviewDate");

  // biome-ignore lint/correctness/useExhaustiveDependencies: only auto-set appliedAt when status changes to "applied"
  useEffect(() => {
    if (watchedStatus === "applied" && !form.getValues("appliedAt")) {
      form.setValue("appliedAt", new Date(), { shouldDirty: true });
    }
  }, [watchedStatus]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only auto-set status when appliedAt changes
  useEffect(() => {
    if (watchedAppliedAt && form.getValues("status") === "saved") {
      form.setValue("status", "applied", { shouldDirty: true });
    }
  }, [watchedAppliedAt]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only auto-set status when interviewDate changes
  useEffect(() => {
    if (
      watchedInterviewDate &&
      ["saved", "applied"].includes(form.getValues("status"))
    ) {
      form.setValue("status", "scheduled", { shouldDirty: true });
    }
  }, [watchedInterviewDate]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: job is excluded so background refetches don't wipe the user's edits
  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(buildDefaultValues(job, initialDescription));
  }, [open, initialDescription, form, job?.id]);

  const onSubmit = form.handleSubmit(async (rawData: TJobFormData) => {
    const { links, topicNames, ...data } = rawData;
    const { status, notes, appliedAt, interviewDate, ...canonical } = data;
    const topicIds = await resolveTopics("topicIds", "topicNames");
    const payload = {
      ...canonical,
      url: canonical.url || null,
      ...(topicIds ? { topicIds } : {}),
      links: serializeJobLinks(links),
    } as ICreateJobDto;

    const track = { status, notes, appliedAt, interviewDate };

    if (job) {
      try {
        await updateJob.mutateAsync({ id: job.id, ...payload });
      } catch {
        toast.error("Failed to update job");
        return;
      }
      try {
        await updateTrack.mutateAsync({ id: job.id, ...track });
      } catch {
        toast.error("Job saved, but status and dates could not be updated");
        return;
      }
      toast.success("Job updated");
    } else {
      try {
        await createJob.mutateAsync({ ...payload, ...track });
      } catch {
        toast.error("Failed to create job");
        return;
      }
      toast.success("Job created");
    }

    onSuccess?.();
  });

  return {
    form,
    onSubmit,
    isLoading:
      createJob.isPending || updateJob.isPending || updateTrack.isPending,
  };
};
