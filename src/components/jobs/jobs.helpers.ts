import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { stringToDate, stripNulls } from "@/lib/utils.ts";

export const STATUS_OPTIONS: { value: TJobStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "scheduled", label: "Scheduled" },
] as const;

const jobPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title too short")
    .max(50, "Keep the title less than 50 characters"),
  companyName: z.string().trim().min(1, "Company name is required"),
  description: z.string().trim().min(10, "Description too short"),
  status: z.enum(JOB_STATUS),
  roleId: z.number().int().positive().nullish(),
  topicIds: z.array(z.number().int().positive()),
  topicNames: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().nullish(),
  deadline: z.date().nullish(),
  location: z.string().nullish(),
  source: z.string().nullish(),
  interviewDate: z.date().nullish(),
  links: z.array(z.object({ value: z.url() })).nullish(),
});
export default jobPostSchema;

export type TJobFormData = z.infer<typeof jobPostSchema>;

export const useJobPostForm = ({
  initialValues,
  initialDescription,
  onSuccess,
}: {
  initialValues?: IJob;
  initialDescription?: string;
  onSuccess?: () => void;
}) => {
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const form = useForm<TJobFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      ...initialValues,
      title: initialValues?.title ?? "",
      companyName: initialValues?.companyName ?? "",
      description: initialDescription ?? initialValues?.description ?? "",
      status: initialValues?.status ?? "saved",
      roleId: initialValues?.roleId ?? null,
      topicIds: initialValues?.topicIds ?? [],
      links: initialValues?.links
        ? initialValues.links
            .split("\n")
            .filter(Boolean)
            .map((v) => ({ value: v }))
        : [],
      deadline: stringToDate(initialValues?.deadline),
      interviewDate: stringToDate(initialValues?.interviewDate),
    },
  });

  const onSubmit = form.handleSubmit(async (rawData: TJobFormData) => {
    const { links, ...data } = rawData;
    const payload = stripNulls({
      ...data,
      links: links
        ? links
            .map((l) => l.value)
            .filter(Boolean)
            .join("\n")
        : "",
    }) as ICreateJobDto;

    try {
      if (initialValues) {
        await updateJob.mutateAsync({ id: initialValues.id, ...payload });
        toast.success("Job updated");
      } else {
        await createJob.mutateAsync(payload);
        toast.success("Job created");
      }
      onSuccess?.();
    } catch {
      toast.error(`Failed to ${initialValues ? "update" : "create"} job`);
    }
  });

  return {
    form,
    onSubmit,
    isPending: createJob.isPending || updateJob.isPending,
  };
};
