import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useIndustries, useTopics } from "@/api/lookups";
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
import {
  buildLookupNameMap,
  formatSectionLabel,
  normalizeLookupName,
} from "@/lib/utils.ts";

const formatSectionNames = (names: TProfileFormSections[]) =>
  names.map(formatSectionLabel).join(", ");

const resolveNamedIds = (
  names: string[] | undefined,
  ids: number[] | undefined,
  idsByName: ReadonlyMap<string, number>
): number[] => [
  ...new Set([
    ...(ids ?? []),
    ...(names ?? [])
      .map((name) => idsByName.get(normalizeLookupName(name)))
      .filter((id): id is number => id !== undefined),
  ]),
];

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

  const topics = useTopics();
  const industries = useIndustries();
  const topicIdsByName = useMemo(
    () => buildLookupNameMap(topics.data),
    [topics.data]
  );
  const industryIdsByName = useMemo(
    () => buildLookupNameMap(industries.data),
    [industries.data]
  );

  const { isDirty, dirtyFields } = form.formState;
  const { reset } = form;

  const onSubmit = form.handleSubmit(async (data: TProfileFormData) => {
    try {
      const resolvedSections: Partial<Record<TProfileFormSections, unknown>> =
        {};
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
          run: () => {
            const { industriesNames, skillNames, ...overviewFields } =
              data.professional;
            const resolved = {
              ...overviewFields,
              industries: resolveNamedIds(
                industriesNames,
                data.professional.industries,
                industryIdsByName
              ),
              industriesNames: [],
              skills: resolveNamedIds(
                skillNames,
                data.professional.skills,
                topicIdsByName
              ),
              skillNames: [],
            };
            resolvedSections.professional = resolved;
            return updateWorkOverview.mutateAsync(resolved);
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
          run: () => {
            const projects = (data.projects ?? []).map((project) => ({
              ...project,
              skills: resolveNamedIds(
                project.skillNames,
                project.skills,
                topicIdsByName
              ),
              skillNames: [],
            }));
            resolvedSections.projects = projects;
            return updateProjects.mutateAsync({ projects });
          },
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
      const failed: TProfileFormSections[] = [];
      for (const [i, result] of results.entries()) {
        (result.status === "fulfilled" ? succeeded : failed).push(
          toRun[i].name
        );
      }

      form.reset({ ...data, ...resolvedSections } as TProfileFormData);
      for (const name of failed) {
        form.setValue(name, data[name as keyof TProfileFormData] as never, {
          shouldDirty: true,
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
