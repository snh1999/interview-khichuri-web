import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import type {
  IResume,
  TProfilePopulated,
} from "@/api/profile/profile.types.ts";
import type {
  TEducationDto,
  TJobPreferencesDto,
  TProfessionalInfoDto,
  TProfileLinkDto,
  TProfilePersonalDto,
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
    queryKey: queryKeys.profile.resumes,
    queryFn: async () => await api.get<IResume[]>("/resume"),
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
    meta: {
      invalidates: queryKeys.profile.resumes,
    },
  });

export const useDeleteResume = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.delete<void>(`/resume/${id}`);
    },
    meta: {
      invalidates: queryKeys.profile.resumes,
    },
  });

export const useSetPrimaryResume = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.patch<void>(`/resume/${id}/primary`);
    },
    meta: {
      invalidates: queryKeys.profile.resumes,
    },
  });

export const useResumeViewUrl = (resumeId: string | null) =>
  useSuspenseQuery({
    queryKey: queryKeys.profile.resumeView(resumeId ?? ""),
    queryFn: async () =>
      await api.get<IViewUrlResponse>(`/resume/${resumeId}/url`),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
