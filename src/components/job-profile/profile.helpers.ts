import { z } from "zod";
import type { TProfilePopulated } from "@/api/profile";
import {
  DEFAULT_MAX_STRING_LENGTH,
  MAX_LARGE_LENGTH,
  MAX_NAME_LENGTH,
  MAX_SHORT_LENGTH,
  MAX_TINY_LENGTH,
  MAX_URL_LENGTH,
} from "@/app.constants.ts";

export const linkTypeSchema = z.enum([
  "github",
  "gitlab",
  "linkedin",
  "portfolio",
  "blog",
  "scholar",
  "other",
]);

export const workTypeSchema = z.enum(["remote", "hybrid", "onsite"]);

export const experienceLevelSchema = z.enum(
  ["junior", "mid", "senior", "lead", "executive"],
  "Please Select an option"
);

export const personalSchema = z.object({
  country: z.string().max(MAX_SHORT_LENGTH).nullish(),
  email: z.email(),
  firstName: z.string().trim().min(1).max(MAX_SHORT_LENGTH),
  lastName: z.string().trim().max(MAX_SHORT_LENGTH),
  location: z.string().max(MAX_SHORT_LENGTH).nullish(),
  nationality: z.string().nullish(),
  phone: z
    .e164("Phone number needs to start with country code, followed by digits")
    .max(MAX_TINY_LENGTH)
    .nullish(),
});

export type TProfilePersonalDto = z.infer<typeof personalSchema>;

export const professionalSchema = z.object({
  experienceLevel: experienceLevelSchema.nullish(),
  industries: z.array(z.number().int().positive()).optional(),
  industriesNames: z
    .array(z.string().trim().min(1).max(MAX_TINY_LENGTH))
    .optional(),
  skillNames: z.array(z.string().trim().min(1).max(MAX_TINY_LENGTH)).optional(),
  skills: z.array(z.number().int().positive()).optional(),
  summary: z.string().max(DEFAULT_MAX_STRING_LENGTH).nullish(),
  title: z.string().trim().min(1, "Job title Can not be empty"),
  yearsOfExperience: z.number().int().min(0).nullish(),
});

export type TProfessionalInfoDto = z.infer<typeof professionalSchema>;

export const workExperienceSchema = z.object({
  company: z.string().trim().min(1).max(MAX_SHORT_LENGTH),
  endDate: z.date().nullish(),
  id: z.uuid().optional(),
  isCurrent: z.boolean(),
  location: z.string().nullish(),
  responsibilities: z.string().max(DEFAULT_MAX_STRING_LENGTH).nullish(),
  startDate: z.date().nullish(),
  // companyId: z.number().int().positive().optional(),
  title: z.string().trim().min(1).max(MAX_NAME_LENGTH),
});

export type TWorkExperienceDto = z.infer<typeof workExperienceSchema>;

export const educationSchema = z.object({
  coursework: z.array(z.string()).max(10).nullish(),
  degreeName: z.string().trim().min(1).max(MAX_SHORT_LENGTH),
  endDate: z.date().nullish(),
  fieldOfStudy: z.string().max(DEFAULT_MAX_STRING_LENGTH).nullish(),
  gpa: z.string().nullish(),
  id: z.uuid().nullish(),
  institution: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  isCurrent: z.boolean(),
  location: z.string().max(MAX_SHORT_LENGTH).nullish(),
  notes: z.string().max(DEFAULT_MAX_STRING_LENGTH).nullish(),
  startDate: z.date().nullish(),
  thesis: z.string().nullish(),
});
export type TEducationDto = z.infer<typeof educationSchema>;

export const preferencesSchema = z.object({
  coverLetterTemplate: z
    .string()
    .max(DEFAULT_MAX_STRING_LENGTH)
    .optional()
    .nullable(),
  coverLetterTone: z
    .string()
    .max(DEFAULT_MAX_STRING_LENGTH)
    .optional()
    .nullable(),
  currency: z.string().length(3).nullish(),
  preferredLocation: z.string().max(MAX_SHORT_LENGTH).nullish(),
  salaryExpected: z.number().int().min(0).nullish(),
  salaryLower: z.number().int().min(0).nullish(),
  titles: z.array(z.number().int().positive()).optional(),
  workType: workTypeSchema.optional().nullable(),
});

export type TJobPreferencesDto = z.infer<typeof preferencesSchema>;

export const profileLinkSchema = z.object({
  type: linkTypeSchema,
  url: z.url().max(MAX_URL_LENGTH),
});

export type TProfileLinkDto = z.infer<typeof profileLinkSchema>;

const optionalUrlSchema = z.union([
  z.literal(""),
  z.url().max(MAX_URL_LENGTH),
  z.undefined(),
]);

const optionalEmailSchema = z.union([z.literal(""), z.email(), z.undefined()]);

export const publicationSchema = z.object({
  authors: z.array(z.string().trim().min(1).max(MAX_NAME_LENGTH)),
  id: z.number().int().positive().optional(),
  link: optionalUrlSchema,
  notes: z.string().max(MAX_LARGE_LENGTH).optional(),
  publicationType: z.string().max(MAX_NAME_LENGTH).optional(),
  title: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  year: z.number().int().optional(),
});
export type TPublicationDto = z.infer<typeof publicationSchema>;

export const projectTypeSchema = z.enum(["project", "research"]);

export const projectSchema = z.object({
  description: z.string().max(DEFAULT_MAX_STRING_LENGTH).optional(),
  id: z.number().int().positive().optional(),
  link: optionalUrlSchema,
  name: z.string().trim().min(1).max(MAX_SHORT_LENGTH),
  skills: z.array(z.number().int().positive()).optional(),
  type: projectTypeSchema,
});
export type TProjectDto = z.infer<typeof projectSchema>;

export const referenceSchema = z.object({
  company: z.string().max(MAX_SHORT_LENGTH).optional(),
  email: optionalEmailSchema,
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1).max(MAX_SHORT_LENGTH),
  notes: z.string().max(MAX_LARGE_LENGTH).optional(),
  phone: z.string().max(MAX_TINY_LENGTH).optional(),
  relationType: z.string().max(DEFAULT_MAX_STRING_LENGTH).optional(),
  title: z.string().max(MAX_SHORT_LENGTH).optional(),
});
export type TReferenceDto = z.infer<typeof referenceSchema>;

export const activitySchema = z.object({
  endDate: z.date().optional(),
  id: z.number().int().positive().optional(),
  isCurrent: z.boolean(),
  name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  notes: z.string().max(DEFAULT_MAX_STRING_LENGTH).nullish(),
  organization: z.string().max(MAX_SHORT_LENGTH).nullish(),
  position: z.string().max(MAX_SHORT_LENGTH).nullish(),
  startDate: z.date().nullish(),
});
export type TActivityDto = z.infer<typeof activitySchema>;

export const profileFormSchema = z.object({
  activities: z.array(activitySchema),
  education: z.array(educationSchema),
  links: z.array(profileLinkSchema),
  personal: personalSchema,
  preferences: preferencesSchema,
  professional: professionalSchema,
  projects: z.array(projectSchema),
  publications: z.array(publicationSchema),
  references: z.array(referenceSchema),
  workExperience: z.array(workExperienceSchema),
});

export type TProfileFormData = z.infer<typeof profileFormSchema>;

export const profileToFormData = (
  profile: TProfilePopulated
): TProfileFormData => {
  const workOverview = profile.workOverviews?.[0];
  const jobPreference = profile.jobPreferences?.[0];

  return {
    activities: (profile.activities ?? []).map((activity) => ({
      endDate: activity.endDate ? new Date(activity.endDate) : undefined,
      id: activity.id,
      isCurrent: activity.isCurrent,
      name: activity.name,
      notes: activity.notes ?? undefined,
      organization: activity.organization ?? undefined,
      position: activity.position ?? undefined,
      startDate: activity.startDate ? new Date(activity.startDate) : undefined,
    })),
    education: (profile.educations ?? []).map((edu) => ({
      ...edu,
      endDate: edu.endDate ? new Date(edu.endDate) : undefined,
      startDate: edu.startDate ? new Date(edu.startDate) : undefined,
    })),
    links: profile.links ?? [],
    personal: {
      ...profile,
    },
    preferences: {
      ...jobPreference,
      titles: (jobPreference?.titles ?? []).map((title) => title.roleId),
    },
    professional: {
      ...workOverview,
      industries: (workOverview?.industries ?? []).map(
        (index) => index.industryId
      ),
      industriesNames: [],
      skillNames: [],
      skills: (workOverview?.skills ?? []).map((skill) => skill.topicId),
      title: workOverview?.title ?? "",
    },
    projects: (profile.projects ?? []).map((project) => ({
      description: project.description ?? undefined,
      id: project.id,
      link: project.link ?? undefined,
      name: project.name,
      skills: (project.skills ?? []).map((skill) => skill.topicId),
      type: project.type ?? "project",
    })),
    publications: (profile.publications ?? []).map(
      ({ authors, ...publication }) => ({
        ...publication,
        authors: authors ?? [],
        link: publication.link ?? undefined,
        notes: publication.notes ?? undefined,
        publicationType: publication.publicationType ?? undefined,
        year: publication.year ?? undefined,
      })
    ),
    references: (profile.references ?? []).map((reference) => ({
      company: reference.company ?? undefined,
      email: reference.email ?? undefined,
      id: reference.id,
      name: reference.name,
      notes: reference.notes ?? undefined,
      phone: reference.phone ?? undefined,
      relationType: reference.relationType ?? undefined,
      title: reference.title ?? undefined,
    })),
    workExperience: (profile.workExperiences ?? []).map((exp) => ({
      ...exp,
      endDate: exp.endDate ? new Date(exp.endDate) : undefined,
      startDate: exp.startDate ? new Date(exp.startDate) : undefined,
    })),
  };
};
