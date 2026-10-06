import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const CAREER_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "career-path",
    category: "career",
    questions: [
      "Walk me through your career.",
      "Tell me about your career journey.",
      "How did you get to where you are today?",
      "Can you walk me through your professional background?",
    ],
    suggestions:
      "Give a concise chronological story emphasizing decisions, progression, relevant skills, and what you are looking for next.",
  },
  {
    id: "job-transitions",
    category: "career",
    questions: [
      "Why did you move between your previous roles?",
      "Walk me through your job changes.",
      "Why have you changed jobs?",
      "What led you from one role to the next?",
    ],
    suggestions:
      "Give factual, positive explanations for transitions and connect them into a coherent career story. Avoid criticizing former employers.",
  },
  {
    id: "most-useful-experience",
    category: "career",
    questions: [
      "Which past experience prepared you most for this role?",
      "What experience is most relevant to this position?",
      "Which part of your background would help you most here?",
      "What previous experience would you draw on in this job?",
    ],
    suggestions:
      "Choose one or two experiences with direct relevance and explain the transferable skills or lessons rather than simply naming the employer or project.",
  },
  {
    id: "next-step",
    category: "career",
    questions: [
      "Why is this the right next step for you?",
      "Why are you looking for this kind of role now?",
      "What do you want from your next career move?",
      "Why make this move at this point in your career?",
    ],
    suggestions:
      "Connect the role's responsibilities to what you've learned and what you want to develop next. Make the transition feel intentional without claiming certainty about the future.",
  },
];
