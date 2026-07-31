import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useResumeById, useUpdateResume } from "@/api/profile";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { profileFormSchema } from "@/components/job-profile/profile.helpers.ts";

const toFormData = (content: TProfileFormData): TProfileFormData => ({
  ...content,
  workExperience: content.workExperience.map((exp) => ({
    ...exp,
    startDate: exp.startDate ? new Date(exp.startDate) : undefined,
    endDate: exp.endDate ? new Date(exp.endDate) : undefined,
  })),
  education: content.education.map((edu) => ({
    ...edu,
    startDate: edu.startDate ? new Date(edu.startDate) : undefined,
    graduationDate: edu.graduationDate
      ? new Date(edu.graduationDate)
      : undefined,
  })),
});

export const useResumeForm = (resumeId: string) => {
  const { data: resume } = useResumeById(resumeId);
  const updateResume = useUpdateResume();

  const form = useForm<TProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: resume.content ? toFormData(resume.content) : undefined,
  });

  const { isDirty } = form.formState;
  const { reset } = form;

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateResume.mutateAsync({ id: resumeId, content: data });
      reset(data, { keepValues: true });
      toast.success("Resume saved successfully");
    } catch {
      toast.error("Failed to save resume");
    }
  });

  return {
    resume,
    form,
    isDirty,
    isSaving: updateResume.isPending,
    onSubmit,
    reset,
  };
};
