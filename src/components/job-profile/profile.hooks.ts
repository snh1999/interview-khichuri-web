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

import type {
  TProfileFormData,
  TProfileFormSections,
} from "@/components/job-profile/profile.helpers.ts";
import {
  profileFormSchema,
  profileToFormData,
} from "@/components/job-profile/profile.helpers.ts";
import { useResolveLookupField } from "@/hooks/useResolveLookupField.ts";
import { formatSectionLabel, stripNulls } from "@/lib/utils.ts";

const formatSectionNames = (names: string[]) =>
  names.map(formatSectionLabel).join(", ");

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
        name: TProfileFormSections;
        dirty: unknown;
        run: () => Promise<unknown>;
      }[] = [
        {
          name: "personal",
          dirty: dirtyFields.personal,
          run: () => updateProfile.mutateAsync(data.personal),
        },
        {
          name: "professional",
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
          name: "workExperience",
          dirty: dirtyFields.workExperience,
          run: () =>
            updateWorkExperience.mutateAsync({
              experiences: data.workExperience,
            }),
        },
        {
          name: "education",
          dirty: dirtyFields.education,
          run: () => updateEducation.mutateAsync({ education: data.education }),
        },
        {
          name: "preferences",
          dirty: dirtyFields.preferences,
          run: () => updatePreferences.mutateAsync(data.preferences),
        },
        {
          name: "links",
          dirty: dirtyFields.links,
          run: () => updateLinks.mutateAsync({ links: data.links }),
        },
        {
          name: "publications",
          dirty: dirtyFields.publications,
          run: () =>
            updatePublications.mutateAsync({ publications: data.publications }),
        },
        {
          name: "projects",
          dirty: dirtyFields.projects,
          run: () => updateProjects.mutateAsync({ projects: data.projects }),
        },
        {
          name: "references",
          dirty: dirtyFields.references,
          run: () =>
            updateReferences.mutateAsync({ references: data.references }),
        },
        {
          name: "activities",
          dirty: dirtyFields.activities,
          run: () =>
            updateActivities.mutateAsync({ activities: data.activities }),
        },
      ];

      const toRun = mutations.filter(({ dirty }) => dirty);
      const results = await Promise.allSettled(toRun.map(({ run }) => run()));

      const succeeded: TProfileFormSections[] = [];
      const failed: string[] = [];
      for (const [i, result] of results.entries()) {
        (result.status === "fulfilled" ? succeeded : failed).push(
          toRun[i].name
        );
      }

      for (const name of succeeded) {
        form.resetField(name, {
          defaultValue: rawData[name as keyof TProfileFormData],
        });
      }

      if (failed.length === 0) {
        toast.success("Profile saved successfully");
      } else if (succeeded.length === 0) {
        toast.error(`Failed to save: ${formatSectionNames(failed)}`);
      } else {
        toast.warning(
          `Saved: ${formatSectionNames(succeeded)}. Failed: ${formatSectionNames(failed)}`
        );
      }
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
