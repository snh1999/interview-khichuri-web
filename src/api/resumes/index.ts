// biome-ignore lint/performance/noBarrelFile: <>
export * from "./idb.ts";

import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
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
import type { TResumeContent } from "@/components/resume/job-profile/resume.helpers.ts";
import { api } from "@/lib/api-client.ts";

export interface IUploadResponse {
  success: boolean;
  filename: string;
}

export interface IViewUrlResponse {
  url: string;
}

export interface IResume {
  id: string;
  profileId: string;
  name: string;
  url: string | null;
  content: TResumeContent | null;
  template: string | null;
  isPrimary: boolean;
  isPublic: boolean;
  slug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TExtractionResult {
  personal: Partial<TProfilePersonalDto>;
  professional: Partial<Omit<TProfessionalInfoDto, "skills" | "industries">> & {
    skills?: number[];
    industries?: number[];
  };
  workExperience: Partial<TWorkExperienceDto>[];
  education: Partial<TEducationDto>[];
  preferences: Partial<Omit<TJobPreferencesDto, "titles">> & {
    titles?: number[];
  };
  links: TProfileLinkDto[];
  publications: Partial<TPublicationDto>[];
  projects: Partial<TProjectDto>[];
  references: Partial<TReferenceDto>[];
  activities: Partial<TActivityDto>[];
}

export const useGetResumes = () =>
  useSuspenseQuery({
    queryFn: async () => await api.get<IResume[]>("/resume"),
    queryKey: queryKeys.resumes.all,
  });

export const useGetResumeById = (id: string) =>
  useSuspenseQuery({
    queryFn: async () => await api.get<IResume>(`/resume/${id}`),
    queryKey: queryKeys.resumes.resumeById(id),
  });

export const usePublicResume = (slug: string) =>
  useSuspenseQuery({
    queryFn: async () => await api.get<IResume>(`/resume/slug/${slug}`),
    queryKey: queryKeys.resumes.resumeBySlug(slug),
  });

export const useCreateResume = () =>
  useMutation({
    mutationFn: async (dto: {
      name: string;
      content: TProfileFormData;
      template?: string;
    }) => await api.post<IResume>("/resume/create", dto),
    meta: { invalidates: queryKeys.resumes.all },
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
    meta: { invalidates: queryKeys.resumes.all },
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
    meta: { invalidates: queryKeys.resumes.all },
  });

export const useDeleteResume = () =>
  useMutation({
    mutationFn: async (id: string) => await api.delete<void>(`/resume/${id}`),
    meta: { invalidates: queryKeys.resumes.all },
  });

export const useSetPrimaryResume = () =>
  useMutation({
    mutationFn: async (id: string) =>
      await api.patch<void>(`/resume/${id}/primary`),
    meta: { invalidates: queryKeys.resumes.all },
  });

// embed causes whole page reload with suspense query
export const useResumeViewUrl = (resumeId: string) =>
  useQuery({
    gcTime: 1000 * 60 * 60,
    queryFn: async () =>
      await api.get<IViewUrlResponse>(`/resume/${resumeId}/url`),
    queryKey: queryKeys.resumes.resumeView(resumeId),
    staleTime: 1000 * 60 * 30,
  });
