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

export interface TProfilePublication {
  id: number;
  profileId: string;
  title: string;
  authors: string[];
  notes: string | null;
  link: string | null;
  year: number | null;
  publicationType: string | null;
}

export interface IProjectSkill {
  id: number;
  projectId: number;
  topicId: number;
  topic: { id: number; name: string };
}

export interface TProject {
  id: number;
  profileId: string;
  name: string;
  type: "project" | "research";
  description: string | null;
  link: string | null;
  skills: IProjectSkill[] | null;
}

export interface TProfileReference {
  id: number;
  profileId: string;
  name: string;
  title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  relationType: string | null;
  notes: string | null;
}

export interface TProfileActivity {
  id: number;
  profileId: string;
  name: string;
  organization: string | null;
  position: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  notes: string | null;
}

export type TProfilePopulated = TProfile & {
  links: TProfileLink[] | null;
  workOverviews: TWorkOverview[] | null;
  workExperiences: TWorkExperience[] | null;
  educations: TEducation[] | null;
  jobPreferences: TJobPreference[] | null;
  publications: TProfilePublication[] | null;
  projects: TProject[] | null;
  references: TProfileReference[] | null;
  activities: TProfileActivity[] | null;
};
