import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import type { TProfilePopulated } from "@/api/profile/profile.types.ts";
import type {
  TActivityDto,
  TEducationDto,
  TJobPreferencesDto,
  TProfessionalInfoDto,
  TProfileLinkDto,
  TProfilePersonalDto,
  TProjectDto,
  TPublicationDto,
  TReferenceDto,
  TWorkExperienceDto,
} from "@/components/job-profile/profile.helpers.ts";
import { api } from "@/lib/api-client.ts";

export const useProfile = () =>
  useSuspenseQuery({
    queryKey: queryKeys.profile.all,
    queryFn: async () => await api.get<TProfilePopulated>("/profile"),
  });

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: async (dto: TProfilePersonalDto) =>
      await api.put("/profile", dto),
    meta: { invalidates: queryKeys.profile.all },
  });

export const useUpdateWorkOverview = () =>
  useMutation({
    mutationFn: async (dto: TProfessionalInfoDto) =>
      await api.put("/profile/work-overview", dto),
    meta: { invalidates: queryKeys.profile.all },
  });

export const useUpdateWorkExperience = () =>
  useMutation({
    mutationFn: async (dto: { experiences: TWorkExperienceDto[] }) =>
      await api.put("/profile/work-experience", dto),
    meta: { invalidates: queryKeys.profile.all },
  });

export const useUpdateEducation = () =>
  useMutation({
    mutationFn: async (dto: { education: TEducationDto[] }) =>
      await api.put("/profile/education", dto),
    meta: { invalidates: queryKeys.profile.all },
  });

export const useUpdatePreferences = () =>
  useMutation({
    mutationFn: async (dto: TJobPreferencesDto) =>
      await api.put("/profile/preferences", dto),
    meta: { invalidates: queryKeys.profile.all },
  });

export const useUpdateLinks = () =>
  useMutation({
    mutationFn: async (dto: { links: TProfileLinkDto[] }) =>
      await api.put("/profile/links", dto),
    meta: { invalidates: queryKeys.profile.all },
  });

export const useUpdatePublications = () =>
  useMutation({
    mutationFn: async (dto: { publications: TPublicationDto[] }) =>
      await api.put("/profile/publications", dto),
    meta: { invalidates: queryKeys.profile.all },
  });

export const useUpdateProjects = () =>
  useMutation({
    mutationFn: async (dto: { projects: TProjectDto[] }) =>
      await api.put("/profile/projects", dto),
    meta: { invalidates: queryKeys.profile.all },
  });

export const useUpdateReferences = () =>
  useMutation({
    mutationFn: async (dto: { references: TReferenceDto[] }) =>
      await api.put("/profile/references", dto),
    meta: { invalidates: queryKeys.profile.all },
  });

export const useUpdateActivities = () =>
  useMutation({
    mutationFn: async (dto: { activities: TActivityDto[] }) =>
      await api.put("/profile/activities", dto),
    meta: { invalidates: queryKeys.profile.all },
  });
