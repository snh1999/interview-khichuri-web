import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type DefaultValues,
  type FieldErrors,
  type Resolver,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { $RefinementCtx } from "zod/v4/core";
import {
  type IJob,
  JOB_STATUS,
  useCreateJob,
  useMatchJobByUrl,
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue.ts";
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

    const { salaryLower, salaryUpper } = data;
    if (salaryLower && salaryUpper && salaryLower > salaryUpper) {
      ctx.addIssue({
        code: "custom",
        message: "Minimum salary can't exceed maximum salary",
        path: ["salaryLower"],
      });
    }
  });
export type TJobFormData = z.infer<typeof jobPostSchema>;

interface IProps {
  job?: IJob;
  open: boolean;
  initialDescription?: string;
  initialUrl?: string;
  onSuccess?: () => void;
}

const buildDefaultValues = (
  job?: IJob,
  initialDescription?: string,
  initialUrl?: string
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
  url: initialUrl ?? job?.url ?? null,
  workType: job?.workType ?? null,
});

const useMatchJob = ({ open }: { open: boolean }) => {
  const matchJob = useMatchJobByUrl();
  const [matchedJob, setMatchedJob] = useState<IJob | null>(null);
  const latestUrlRef = useRef<string | null>(null);

  const clearMatch = useCallback(() => {
    latestUrlRef.current = null;
    setMatchedJob(null);
  }, []);

  const checkUrl = useCallback(
    async (url: string) => {
      latestUrlRef.current = url;
      try {
        const matches = await matchJob.mutateAsync(url);
        if (latestUrlRef.current === url) {
          setMatchedJob(matches[0] ?? null);
        }
      } catch {
        if (latestUrlRef.current === url) {
          setMatchedJob(null);
        }
      }
    },
    [matchJob.mutateAsync]
  );

  useEffect(() => {
    if (!open) {
      clearMatch();
    }
  }, [open, clearMatch]);

  return {
    matchedJob,
    checkUrl,
    clearMatch,
  };
};

const TRACK_FIELDS = ["status", "notes", "appliedAt", "interviewDate"];

export const useJobPostForm = ({
  job,
  open,
  initialDescription,
  initialUrl,
  onSuccess,
}: IProps): TFormHook<TJobFormData> & {
  matchedJob: IJob | null;
  isSystemJob: boolean;
} => {
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const updateTrack = useUpdateTrackedJob();
  const { matchedJob, checkUrl, clearMatch } = useMatchJob({ open });

  const baseResolver = zodResolver(jobPostSchema) as Resolver<TJobFormData>;
  const isSystemJob = Boolean(job && !job.userId);

  const form = useForm<TJobFormData>({
    defaultValues: buildDefaultValues(job, initialDescription, initialUrl),
    resolver: async (values, context, options) => {
      const result = await baseResolver(values, context, options);
      if (!isSystemJob || Object.keys(result.errors).length === 0) {
        return result;
      }
      const errors = Object.fromEntries(
        Object.entries(result.errors).filter(([key]) =>
          TRACK_FIELDS.includes(key)
        )
      ) as FieldErrors<TJobFormData>;
      return Object.keys(errors).length > 0
        ? { values: {}, errors }
        : { values, errors: {} };
    },
  });

  const resolveTopics = useResolveLookupField(form, "topics");

  const watchedUrl = form.watch("url");
  const debouncedUrl = useDebouncedValue(watchedUrl ?? "", 1000);
  const settledUrl =
    (watchedUrl ?? "") === debouncedUrl ? normalizeHttpUrl(debouncedUrl) : "";

  useEffect(() => {
    const { unsubscribe } = form.watch((values, { name, type }) => {
      if (type !== "change") {
        return; // ignore reset()/setValue()/setValues()
      }
      const { status, appliedAt, interviewDate } = values;

      if (name === "status" && status === "applied" && !appliedAt) {
        form.setValue("appliedAt", new Date(), { shouldDirty: true });
      }
      if (name === "appliedAt" && appliedAt && status === "saved") {
        form.setValue("status", "applied", { shouldDirty: true });
      }
      if (
        name === "interviewDate" &&
        interviewDate &&
        (status === "saved" || status === "applied")
      ) {
        form.setValue("status", "scheduled", { shouldDirty: true });
      }
    });
    return unsubscribe;
  }, [form]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: job is excluded so background refetches don't wipe the user's edits
  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(buildDefaultValues(job, initialDescription, initialUrl));
  }, [open, initialDescription, initialUrl, form, job?.id]);

  useEffect(() => {
    if (open && !job?.id && settledUrl) {
      checkUrl(settledUrl);
    } else {
      clearMatch();
    }
  }, [open, settledUrl, checkUrl, clearMatch, job?.id]);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <>
  const onSubmit = form.handleSubmit(async (rawData: TJobFormData) => {
    const { links, topicNames, ...data } = rawData;
    const { status, notes, appliedAt, interviewDate, ...canonical } = data;
    const topicIds = isSystemJob
      ? undefined
      : await resolveTopics("topicIds", "topicNames");
    const payload = {
      ...canonical,
      url: canonical.url || null,
      ...(topicIds ? { topicIds } : {}),
      links: serializeJobLinks(links),
    };

    const track = { status, notes, appliedAt, interviewDate };

    if (job) {
      if (job.userId) {
        try {
          await updateJob.mutateAsync({ id: job.id, ...payload });
        } catch {
          toast.error("Failed to update job");
          return;
        }
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
    matchedJob,
    isSystemJob,
    isLoading:
      createJob.isPending || updateJob.isPending || updateTrack.isPending,
  };
};
