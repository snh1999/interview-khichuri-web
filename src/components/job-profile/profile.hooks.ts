import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useProfile,
  useUpdateEducation,
  useUpdateLinks,
  useUpdatePreferences,
  useUpdateProfile,
  useUpdateWorkExperience,
  useUpdateWorkOverview,
} from "@/api/profile";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import {
  profileFormSchema,
  profileToFormData,
} from "@/components/job-profile/profile.helpers.ts";

const stripNulls = (value: unknown): unknown => {
  if (value === null) {
    return;
  }
  if (Array.isArray(value)) {
    return value.map(stripNulls);
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, stripNulls(v)])
    );
  }
  return value;
};

export const getUseJobProfileForm = () => {
  const { data: profileData } = useProfile();
  const data = profileToFormData(profileData);

  const updateProfile = useUpdateProfile();
  const updateWorkOverview = useUpdateWorkOverview();
  const updateWorkExperience = useUpdateWorkExperience();
  const updateEducation = useUpdateEducation();
  const updatePreferences = useUpdatePreferences();
  const updateLinks = useUpdateLinks();

  const isSaving =
    updateProfile.isPending ||
    updateWorkOverview.isPending ||
    updateWorkExperience.isPending ||
    updateEducation.isPending ||
    updatePreferences.isPending ||
    updateLinks.isPending;

  const form = useForm<TProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: data,
  });

  const { isDirty, dirtyFields } = form.formState;
  const { reset } = form;

  const onSubmit = form.handleSubmit(async (rawData: TProfileFormData) => {
    const data = stripNulls(rawData) as TProfileFormData;

    try {
      const mutations = [];

      if (dirtyFields.personal) {
        mutations.push(updateProfile.mutateAsync(data.personal));
      }
      if (dirtyFields.professional) {
        mutations.push(updateWorkOverview.mutateAsync(data.professional));
      }
      if (dirtyFields.workExperience) {
        mutations.push(
          updateWorkExperience.mutateAsync({ experiences: data.workExperience })
        );
      }
      if (dirtyFields.education) {
        mutations.push(
          updateEducation.mutateAsync({ education: data.education })
        );
      }
      if (dirtyFields.preferences) {
        mutations.push(updatePreferences.mutateAsync(data.preferences));
      }
      if (dirtyFields.links) {
        mutations.push(updateLinks.mutateAsync({ links: data.links }));
      }

      await Promise.all(mutations);
      reset(data, { keepValues: true });
      toast.success("Profile saved successfully");
    } catch {
      toast.error("Failed to save profile");
    }
  });

  return {
    data,
    form,
    isDirty,
    isSaving,
    onSubmit,
    reset,
  };
};
