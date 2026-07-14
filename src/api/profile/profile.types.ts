import type {
  TEducationDto,
  TJobPreferencesDto,
  TProfessionalInfoDto,
  TProfileLinkDto,
  TProfilePersonalDto,
  TWorkExperienceDto,
} from "@/components/job-profile/profile.helpers.ts";

export type TProfile = TProfilePersonalDto & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type TProfileLink = TProfileLinkDto & {
  id: number;
  profileId: string;
};

interface IWorkOverviewSkill {
  id: number;
  topic: { id: number; name: string };
  topicId: number;
  workId: number;
}

interface IWorkOverviewIndustry {
  id: number;
  industry: { id: number; name: string };
  industryId: number;
  workId: number;
}

export type TWorkOverview = Omit<
  TProfessionalInfoDto,
  "skills" | "industries"
> & {
  id: number;
  profileId: string;
  skills: IWorkOverviewSkill[];
  industries: IWorkOverviewIndustry[];
};

export type TWorkExperience = TWorkExperienceDto & {
  id: string;
  profileId: string;
  companyId: number | null;
};

export type TEducation = TEducationDto & {
  id: string | null;
  profileId: string;
};

interface IPreferenceTitle {
  id: number;
  preferenceId: string;
  role: { id: number; name: string };
  roleId: number;
}

export type TJobPreference = Omit<TJobPreferencesDto, "titles"> & {
  id: string;
  profileId: string;
  titles: IPreferenceTitle[];
};

export interface IResume {
  id: string;
  profileId: string;
  name: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TProfilePopulated = TProfile & {
  links: TProfileLink[] | null;
  workOverviews: TWorkOverview[] | null;
  workExperiences: TWorkExperience[] | null;
  educations: TEducation[] | null;
  jobPreferences: TJobPreference[] | null;
};
