import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, queryKeys } from "@/api";
import type { TApiKeyProvider } from "@/api/keys";
import { api } from "@/lib/api-client";
import {
  getAtsScoreEntries,
  getCachedStandaloneReview,
  type IAtsCacheEntry,
  type IAtsScoreFilter,
  type IStandaloneReviewCacheEntry,
  setAtsScore,
  setStandaloneReview,
} from "@/lib/indexdb";

export type TAtsCategoryKey =
  | "skillsMatch"
  | "keywordHitRate"
  | "experienceFit"
  | "roleAlignment";

export type TTipType = "good" | "improve";

export interface TTip {
  type: TTipType;
  tip: string;
  explanation: string;
}

export interface TAtsCategory {
  key: TAtsCategoryKey;
  score: number;
  tips: TTip[];
}

export interface TAtsScore {
  overall: number;
  categories: TAtsCategory[];
  recommendations: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  tailoringNotes: string;
}

export interface ICompany {
  id: number;
  name: string;
  aliases?: string[] | null;
  links?: { type: string; url: string }[] | null;
  careerPageUrl?: string | null;
  researchDossier?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

interface IScoreResumeDto {
  jobId: string;
  resumeId: string;
  provider: TApiKeyProvider | string;
  model?: string | null;
}

export type TStandaloneCategoryKey =
  | "toneAndStyle"
  | "content"
  | "structure"
  | "skills";

export interface TStandaloneCategory {
  key: TStandaloneCategoryKey;
  score: number;
  tips: TTip[];
}

export interface TStandaloneReview {
  overall: number;
  categories: TStandaloneCategory[];
}

interface IReviewResumeDto {
  resumeId: string;
  provider: TApiKeyProvider | string;
  model?: string | null;
}

export const useAtsScoreEntries = (filter?: IAtsScoreFilter) =>
  useQuery({
    queryFn: async () => await getAtsScoreEntries(filter),
    queryKey: queryKeys.resumes.ats.filter(filter),
  });

export const useCachedStandaloneReview = (resumeId: string) =>
  useQuery({
    queryFn: async () => await getCachedStandaloneReview(resumeId),
    queryKey: queryKeys.resumes.reviewById(resumeId),
  });

export const useScoreResume = () =>
  useMutation({
    mutationFn: async (dto: IScoreResumeDto) =>
      await api.post<TAtsScore>("/resume/score", dto, {
        timeoutMs: 120_000,
      }),
    onSuccess: async (data, dto) => {
      try {
        await setAtsScore({ ...dto, ...data });

        const entries = await getAtsScoreEntries({
          jobId: dto.jobId,
          resumeId: dto.resumeId,
        });
        apiClient.setQueryData<IAtsCacheEntry[]>(
          queryKeys.resumes.ats.filter({
            jobId: dto.jobId,
            resumeId: dto.resumeId,
          }),
          entries
        );
        await apiClient.invalidateQueries({
          queryKey: queryKeys.resumes.ats.all,
        });
      } catch {
        // IndexedDB unavailable — score still returned from server
      }
    },
  });

export const useReviewResumeStandalone = () =>
  useMutation({
    mutationFn: async (dto: IReviewResumeDto) =>
      await api.post<TStandaloneReview>("/resume/review-standalone", dto, {
        timeoutMs: 120_000,
      }),
    onSuccess: async (data, dto) => {
      try {
        const entry = await setStandaloneReview(
          dto.resumeId,
          data.overall,
          data.categories
        );
        apiClient.setQueryData<IStandaloneReviewCacheEntry>(
          queryKeys.resumes.reviewById(dto.resumeId),
          entry
        );
      } catch {
        // IndexedDB unavailable — review still returned from server
      }
    },
  });
