import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";

export type TTabKey =
  | "personal"
  | "professional"
  | "experience"
  | "education"
  | "preferences"
  | "links"
  | "publications"
  | "projects"
  | "references"
  | "activities";
export const REQUIRED_FIELDS: {
  label: string;
  tab: TTabKey;
  isFilled: (data: TProfileFormData) => boolean;
}[] = [
  {
    label: "FIRST NAME",
    tab: "personal",
    isFilled: (data) => Boolean(data.personal.firstName),
  },
  {
    label: "LAST NAME",
    tab: "personal",
    isFilled: (data) => Boolean(data.personal.lastName),
  },
  {
    label: "EMAIL",
    tab: "personal",
    isFilled: (data) => Boolean(data.personal.email),
  },
  {
    label: "PHONE",
    tab: "personal",
    isFilled: (data) => Boolean(data.personal.phone),
  },
  {
    label: "TITLE",
    tab: "professional",
    isFilled: (data) => Boolean(data.professional.title),
  },
  {
    label: "LEVEL",
    tab: "professional",
    isFilled: (data) => Boolean(data.professional.experienceLevel),
  },
  {
    label: "EXPERIENCE",
    tab: "professional",
    isFilled: (data) => (data.professional.yearsOfExperience ?? -1) >= 0,
  },
  {
    label: "SKILLS",
    tab: "professional",
    isFilled: (data) => (data.professional.skills ?? []).length > 0,
  },
  {
    label: "EDUCATION",
    tab: "education",
    isFilled: (data) => data.education.length > 0,
  },
  {
    label: "LINKS",
    tab: "links",
    isFilled: (data) => data.links.length > 1,
  },
] as const;
export const EXPERIENCE_LEVELS = [
  { label: "Junior", value: "junior" },
  { label: "Mid-Level", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Lead", value: "lead" },
  { label: "Executive", value: "executive" },
] as const;

export const REMOTE_PREFERENCES = [
  { label: "Remote", value: "remote" },
  { label: "On-site", value: "onsite" },
  { label: "Hybrid", value: "hybrid" },
] as const;

export const PROJECT_TYPES = [
  { label: "Project", value: "project" },
  { label: "Research", value: "research" },
] as const;

export const DEGREES = [
  { label: "High School", value: "high_school" },
  { label: "Associate", value: "associate" },
  { label: "Bachelor's", value: "bachelor" },
  { label: "Master's", value: "master" },
  { label: "Doctorate", value: "doctorate" },
] as const;

export const COVER_LETTER_TONES = [
  { label: "Formal", value: "formal" },
  { label: "Casual", value: "casual" },
  { label: "Enthusiastic", value: "enthusiastic" },
] as const;

export const CURRENCIES = [
  { label: "BDT (৳)", value: "BDT" },
  { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" },
  { label: "GBP (£)", value: "GBP" },
  { label: "BDT (৳)", value: "BDT" },
  { label: "CAD (C$)", value: "CAD" },
  { label: "AUD (A$)", value: "AUD" },
] as const;
