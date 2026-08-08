import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useProfile,
  useUpdateActivities,
  useUpdateEducation,
  useUpdateLinks,
  useUpdatePreferences,
  useUpdateProfile,
  useUpdateProjects,
  useUpdatePublications,
  useUpdateReferences,
  useUpdateWorkExperience,
  useUpdateWorkOverview,
} from "@/api/profile";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import {
  profileFormSchema,
  profileToFormData,
} from "@/components/job-profile/profile.helpers.ts";
import { useResolveLookupField } from "@/hooks/useResolveLookupField.ts";
import { stripNulls } from "@/lib/utils.ts";

export const getUseJobProfileForm = () => {
  const { data: profileData } = useProfile();
  const formData = profileToFormData(profileData);

  const updateProfile = useUpdateProfile();
  const updateWorkOverview = useUpdateWorkOverview();
  const updateWorkExperience = useUpdateWorkExperience();
  const updateEducation = useUpdateEducation();
  const updatePreferences = useUpdatePreferences();
  const updateLinks = useUpdateLinks();
  const updatePublications = useUpdatePublications();
  const updateProjects = useUpdateProjects();
  const updateReferences = useUpdateReferences();
  const updateActivities = useUpdateActivities();

  const isSaving =
    updateProfile.isPending ||
    updateWorkOverview.isPending ||
    updateWorkExperience.isPending ||
    updateEducation.isPending ||
    updatePreferences.isPending ||
    updateLinks.isPending ||
    updatePublications.isPending ||
    updateProjects.isPending ||
    updateReferences.isPending ||
    updateActivities.isPending;

  const form = useForm<TProfileFormData>({
    defaultValues: formData,
    resolver: zodResolver(profileFormSchema),
  });

  const resolveIndustries = useResolveLookupField(form, "industries");
  const resolveSkills = useResolveLookupField(form, "topics");

  const { isDirty, dirtyFields } = form.formState;
  const { reset } = form;

  const onSubmit = form.handleSubmit(async (rawData: TProfileFormData) => {
    const data = stripNulls(rawData) as TProfileFormData;

    try {
      const mutations: {
        dirty: unknown;
        run: () => Promise<unknown>;
      }[] = [
        {
          dirty: dirtyFields.personal,
          run: () => updateProfile.mutateAsync(data.personal),
        },
        {
          dirty: dirtyFields.professional,
          run: async () => {
            const { industriesNames, skillNames, ...overviewFields } =
              data.professional;
            const skills = await resolveSkills(
              "professional.skills",
              "professional.skillNames"
            );
            const industries = await resolveIndustries(
              "professional.industries",
              "professional.industriesNames"
            );
            return updateWorkOverview.mutateAsync({
              ...overviewFields,
              ...(Array.isArray(skills) ? { skills } : {}),
              ...(Array.isArray(industries) ? { industries } : {}),
            });
          },
        },
        {
          dirty: dirtyFields.workExperience,
          run: () =>
            updateWorkExperience.mutateAsync({
              experiences: data.workExperience,
            }),
        },
        {
          dirty: dirtyFields.education,
          run: () => updateEducation.mutateAsync({ education: data.education }),
        },
        {
          dirty: dirtyFields.preferences,
          run: () => updatePreferences.mutateAsync(data.preferences),
        },
        {
          dirty: dirtyFields.links,
          run: () => updateLinks.mutateAsync({ links: data.links }),
        },
        {
          dirty: dirtyFields.publications,
          run: () =>
            updatePublications.mutateAsync({ publications: data.publications }),
        },
        {
          dirty: dirtyFields.projects,
          run: () => updateProjects.mutateAsync({ projects: data.projects }),
        },
        {
          dirty: dirtyFields.references,
          run: () =>
            updateReferences.mutateAsync({ references: data.references }),
        },
        {
          dirty: dirtyFields.activities,
          run: () =>
            updateActivities.mutateAsync({ activities: data.activities }),
        },
      ];

      await Promise.all(
        mutations.filter(({ dirty }) => dirty).map(({ run }) => run())
      );
      reset(rawData, { keepDirty: false });
      toast.success("Profile saved successfully");
    } catch {
      toast.error("Failed to save profile");
    }
  });

  return {
    data: formData,
    form,
    isDirty,
    isSaving,
    onSubmit,
    reset,
  };
};
