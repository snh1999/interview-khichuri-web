import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const BEHAVIORAL_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "tell-me-about-yourself",
    category: "behavioral",
    questions: [
      "Tell me about yourself.",
      "Walk me through your background.",
      "Can you introduce yourself?",
      "Give me a brief summary of who you are and what you do.",
    ],
    suggestions:
      "This is usually the opening question and sets the tone for the interview. " +
      "Recruiters want a concise, structured summary that ties your past, present, " +
      "and future into one story: where you started, what you do now, and why this " +
      "role is the next step. Keep it to 60-90 seconds, lead with your most relevant " +
      "experience, and end by connecting your goals to the position you are applying for.",
  },
];
