import { z } from "zod";
import type { TProfilePopulated } from "@/api/profile";

export const linkTypeSchema = z.enum([
  "github",
  "gitlab",
  "linkedin",
  "portfolio",
  "blog",
  "other",
]);

export const workTypeSchema = z.enum(["remote", "hybrid", "onsite"]);

export const experienceLevelSchema = z.enum(
  ["junior", "mid", "senior", "lead", "executive"],
  "Please Select an option"
);

export const personalSchema = z.object({
  email: z.email(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim(),
  phone: z
    .e164("Phone number needs to start with country code, followed by digits")
    .nullable()
    .optional(),
  location: z.string().nullable().optional(),
  country: z.string().length(2).nullable().optional(),
});

export type TProfilePersonalDto = z.infer<typeof personalSchema>;

export const professionalSchema = z.object({
  title: z.string().trim().min(1, "Job title Can not be empty"),
  experienceLevel: experienceLevelSchema.nullable().optional(),
  yearsOfExperience: z.number().int().min(0).nullable().optional(),
  skills: z.array(z.number().int().positive()).optional(),
  industries: z.array(z.number().int().positive()).optional(),
});

export type TProfessionalInfoDto = z.infer<typeof professionalSchema>;

const workExperienceSchema = z.object({
  id: z.uuid().optional(),
  company: z.string().trim().min(1),
  // companyId: z.number().int().positive().optional(),
  title: z.string().trim().min(1),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isCurrent: z.boolean(),
  responsibilities: z.string().optional(),
});

export type TWorkExperienceDto = z.infer<typeof workExperienceSchema>;

const educationSchema = z.object({
  id: z.uuid().optional(),
  degreeName: z.string().trim().min(1),
  fieldOfStudy: z.string().optional(),
  institution: z.string().trim().min(1),
  country: z.string().nullable().optional(),
  startDate: z.date().optional(),
  graduationDate: z.date().optional(),
  notes: z.string().optional(),
});

export type TEducationDto = z.infer<typeof educationSchema>;

const preferencesSchema = z.object({
  workType: workTypeSchema.optional().nullable(),
  salaryLower: z.number().int().min(0).nullable().optional(),
  salaryExpected: z.number().int().min(0).nullable().optional(),
  currency: z.string().length(3).nullable().optional(),
  preferredLocation: z.string().nullable().optional(),
  coverLetterTone: z.string().optional().nullable(),
  coverLetterTemplate: z.string().optional().nullable(),
  titles: z.array(z.number().int().positive()).optional().nullable(),
});

export type TJobPreferencesDto = z.infer<typeof preferencesSchema>;

const profileLinkSchema = z.object({
  type: linkTypeSchema,
  url: z.url(),
});

export type TProfileLinkDto = z.infer<typeof profileLinkSchema>;

export const profileFormSchema = z.object({
  personal: personalSchema,
  professional: professionalSchema,
  workExperience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  preferences: preferencesSchema,
  links: z.array(profileLinkSchema),
});

export type TProfileFormData = z.infer<typeof profileFormSchema>;

export const profileToFormData = (
  profile: TProfilePopulated
): TProfileFormData => {
  const workOverview = profile.workOverviews?.[0];
  const jobPreference = profile.jobPreferences?.[0];

  return {
    personal: {
      ...profile,
    },
    professional: {
      ...workOverview,
      title: workOverview?.title ?? "",
      skills: workOverview?.skills.map((skill) => skill.topicId) ?? [],
      industries:
        workOverview?.industries.map((index) => index.industryId) ?? [],
    },
    workExperience: (profile.workExperiences ?? []).map((exp) => ({
      ...exp,
      startDate: exp.startDate ? new Date(exp.startDate) : undefined,
      endDate: exp.endDate ? new Date(exp.endDate) : undefined,
    })),
    education: (profile.educations ?? []).map((edu) => ({
      ...edu,
      startDate: edu.startDate ? new Date(edu.startDate) : undefined,
      graduationDate: edu.graduationDate
        ? new Date(edu.graduationDate)
        : undefined,
    })),
    preferences: {
      ...jobPreference,
      titles: jobPreference?.titles.map((title) => title.roleId) ?? [],
    },
    links: profile.links ?? [],
  };
};
