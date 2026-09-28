import { CAREER_QUESTION_BANK } from "@/lib/questions/career.ts";
import { COMMUNICATION_QUESTION_BANK } from "@/lib/questions/communication.ts";
import { LEADERSHIP_QUESTION_BANK } from "@/lib/questions/leadership.ts";
import { MOTIVATION_QUESTION_BANK } from "@/lib/questions/motivation.ts";
import { PROBLEM_SOLVING_QUESTION_BANK } from "@/lib/questions/problem-solving.ts";
import { ROLE_SPECIFIC_QUESTION_BANK } from "@/lib/questions/role-specific.ts";
import { SITUATIONAL_QUESTION_BANK } from "@/lib/questions/situational.ts";
import { SYSTEM_DESIGN_QUESTION_BANK } from "@/lib/questions/system-design.ts";
import { TEAMWORK_QUESTION_BANK } from "@/lib/questions/teamwork.ts";
import { TECHNICAL_QUESTION_BANK } from "@/lib/questions/technical.ts";
import { BEHAVIORAL_QUESTION_BANK } from "./behavioral.ts";
import { GENERAL_QUESTION_BANK } from "./general";

export const QUESTION_BANK_CATEGORIES = [
  "behavioral",
  "general",
  "situational",
  "career",
  "motivation",
  "communication",
  "leadership",
  "teamwork",
  "problemSolving",
  "technical",
  "systemDesign",
  "roleSpecific",
] as const;

export type TQuestionBankCategory = (typeof QUESTION_BANK_CATEGORIES)[number];

export const QUESTION_BANK_CATEGORY_LABELS: Record<
  TQuestionBankCategory,
  string
> = {
  behavioral: "Behavioral",
  general: "General",
  situational: "Situational",
  career: "Career",
  motivation: "Motivation",
  communication: "Communication",
  leadership: "Leadership",
  teamwork: "Teamwork",
  problemSolving: "Problem Solving",
  technical: "Technical",
  systemDesign: "System Design",
  roleSpecific: "Role Specific",
};

export interface IQuestionBankItem {
  id: string;
  category: TQuestionBankCategory;
  questions: string[];
  suggestions: string;
}

export const QUESTION_BANK: IQuestionBankItem[] = [
  ...BEHAVIORAL_QUESTION_BANK,
  ...GENERAL_QUESTION_BANK,
  ...SITUATIONAL_QUESTION_BANK,
  ...CAREER_QUESTION_BANK,
  ...MOTIVATION_QUESTION_BANK,
  ...COMMUNICATION_QUESTION_BANK,
  ...LEADERSHIP_QUESTION_BANK,
  ...TEAMWORK_QUESTION_BANK,
  ...PROBLEM_SOLVING_QUESTION_BANK,
  ...TECHNICAL_QUESTION_BANK,
  ...SYSTEM_DESIGN_QUESTION_BANK,
  ...ROLE_SPECIFIC_QUESTION_BANK,
];

export const getQuestionBankItem = (
  id?: string | null
): IQuestionBankItem | undefined =>
  QUESTION_BANK.find((item) => item.id === id);
