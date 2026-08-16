import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import type {
  IResume,
  TExtractionResult,
  TProfilePopulated,
} from "@/api/profile/profile.types.ts";
import type {
  TActivityDto,
  TEducationDto,
  TJobPreferencesDto,
  TProfessionalInfoDto,
  TProfileFormData,
  TProfileLinkDto,
  TProfilePersonalDto,
  TProjectDto,
  TPublicationDto,
  TReferenceDto,
  TWorkExperienceDto,
} from "@/components/job-profile/profile.helpers.ts";
import { api } from "@/lib/api-client.ts";

export interface IUploadResponse {
  success: boolean;
  filename: string;
}

export interface IViewUrlResponse {
  url: string;
}

export const useProfile = () =>
  useSuspenseQuery({
    queryKey: queryKeys.profile.all,
    queryFn: async () => await api.get<TProfilePopulated>("/profile"),
  });

export const useResumes = () =>
  useSuspenseQuery({
    queryFn: async () => await api.get<IResume[]>("/resume"),
    queryKey: queryKeys.profile.resumes,
  });

export const useResumeById = (id: string) =>
  useSuspenseQuery({
    queryFn: async () => await api.get<IResume>(`/resume/${id}`),
    queryKey: queryKeys.profile.resumeById(id),
  });

export const usePublicResume = (slug: string) =>
  useSuspenseQuery({
    queryFn: async () => await api.get<IResume>(`/resume/slug/${slug}`),
    queryKey: queryKeys.profile.resumeBySlug(slug),
  });

export const useCreateResume = () =>
  useMutation({
    mutationFn: async (dto: {
      name: string;
      content: TProfileFormData;
      template?: string;
    }) => await api.post<IResume>("/resume/create", dto),
    meta: { invalidates: queryKeys.profile.resumes },
  });

export const useUpdateResume = () =>
  useMutation({
    mutationFn: async (dto: {
      id: string;
      name?: string;
      content?: TProfileFormData;
      template?: string;
      isPublic?: boolean;
    }) => {
      const { id, ...data } = dto;
      return await api.patch<IResume>(`/resume/${id}`, data);
    },
    meta: { invalidates: queryKeys.profile.resumes },
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

export const useExtractResume = () =>
  useMutation({
    mutationFn: async ({ id, provider }: { id: string; provider: string }) =>
      await api.post<TExtractionResult>(
        `/resume/${id}/extract`,
        { provider },
        { timeoutMs: 120_000 }
      ),
  });

export const useUploadResume = () =>
  useMutation({
    mutationFn: async ({ file, name }: { file: File; name?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (name?.trim()) {
        formData.append("name", name.trim());
      }
      return await api.upload<IUploadResponse>("/resume", formData);
    },
    meta: { invalidates: queryKeys.profile.resumes },
  });

export const useDeleteResume = () =>
  useMutation({
    mutationFn: async (id: string) => await api.delete<void>(`/resume/${id}`),
    meta: { invalidates: queryKeys.profile.resumes },
  });

export const useSetPrimaryResume = () =>
  useMutation({
    mutationFn: async (id: string) =>
      await api.patch<void>(`/resume/${id}/primary`),
    meta: { invalidates: queryKeys.profile.resumes },
  });

export const useResumeViewUrl = (resumeId: string | null) =>
  useSuspenseQuery({
    gcTime: 1000 * 60 * 60,
    queryFn: async () =>
      await api.get<IViewUrlResponse>(`/resume/${resumeId}/url`),
    queryKey: queryKeys.profile.resumeView(resumeId ?? ""),
    staleTime: 1000 * 60 * 30,
  });
