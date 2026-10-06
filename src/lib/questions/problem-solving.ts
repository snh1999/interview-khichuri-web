import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const PROBLEM_SOLVING_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "problem-solving-approach",
    category: "problemSolving",
    questions: [
      "How do you approach a difficult problem?",
      "Walk me through your problem-solving process.",
      "How do you solve unfamiliar problems?",
      "What steps do you take when you don't know the answer?",
    ],
    suggestions:
      "Explain a repeatable process: define the problem, gather relevant information, identify constraints, consider options, test assumptions, decide, and evaluate the result.",
  },
  {
    id: "root-cause",
    category: "problemSolving",
    questions: [
      "Tell me about a time you found the root cause of a problem.",
      "How do you identify the underlying cause of a problem?",
      "Describe a problem where the obvious cause wasn't the real cause.",
      "How do you avoid treating symptoms instead of causes?",
    ],
    suggestions:
      "Use an example showing investigation rather than guesswork. Explain what evidence led you from symptoms to the underlying cause.",
  },
  {
    id: "tradeoff",
    category: "problemSolving",
    questions: [
      "Tell me about a difficult tradeoff you made.",
      "Describe a decision where there was no perfect option.",
      "How do you make decisions when every option has drawbacks?",
      "Tell me about a time you had to balance competing priorities.",
    ],
    suggestions:
      "Identify the competing objectives and constraints, explain how you evaluated them, and make the consequences of your choice explicit.",
  },
  {
    id: "data-driven",
    category: "problemSolving",
    questions: [
      "Tell me about a decision you made using data.",
      "How do you use evidence when making decisions?",
      "Describe a time data changed your approach.",
      "Tell me about a time you used analysis to solve a problem.",
    ],
    suggestions:
      "Explain what information mattered, how you evaluated its reliability, and how it changed the decision. Don't imply that data automatically makes every decision correct.",
  },
];
