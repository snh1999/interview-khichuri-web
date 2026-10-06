import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const ROLE_SPECIFIC_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "role-understanding",
    category: "roleSpecific",
    questions: [
      "What do you think this role involves?",
      "How do you understand the responsibilities of this position?",
      "What do you think you'll be doing in this role?",
      "What do you see as the most important part of this job?",
    ],
    suggestions:
      "Demonstrate that you've read the role description and connect its major responsibilities to your experience. Mention uncertainties as questions rather than inventing details.",
  },
  {
    id: "first-90-days",
    category: "roleSpecific",
    questions: [
      "What would you do in your first 90 days?",
      "How would you approach your first few months here?",
      "What would your priorities be when you start?",
      "How would you get up to speed in this role?",
    ],
    suggestions:
      "Focus first on learning goals, relationships, expectations, and small useful contributions. Avoid presenting an elaborate transformation plan before understanding the environment.",
  },
  {
    id: "first-priority",
    category: "roleSpecific",
    questions: [
      "What would you focus on first in this role?",
      "What would your first priority be?",
      "Where would you start if you got the job?",
      "What would you want to accomplish first?",
    ],
    suggestions:
      "Tie your answer to understanding goals, stakeholders, constraints, and current problems before committing to a solution.",
  },
  {
    id: "success-role",
    category: "roleSpecific",
    questions: [
      "How would you measure success in this role?",
      "What would success look like for you in this position?",
      "How would you know you were doing well after six months?",
      "What outcomes would tell you you're succeeding?",
    ],
    suggestions:
      "Use the role's actual responsibilities to identify outcomes, quality, relationships, and learning. Avoid inventing metrics you have no basis for.",
  },
  {
    id: "role-challenge",
    category: "roleSpecific",
    questions: [
      "What do you think would be most challenging about this role?",
      "What part of this job do you expect to find difficult?",
      "Which responsibility would require the most development for you?",
      "What would be your biggest challenge if hired?",
    ],
    suggestions:
      "Identify a realistic challenge without undermining your candidacy. Explain how you would approach the learning curve or constraint.",
  },
  {
    id: "questions-for-us",
    category: "roleSpecific",
    questions: [
      "Do you have any questions for us?",
      "What questions do you have for me?",
      "Is there anything you'd like to ask?",
      "What would you like to know about the role or company?",
    ],
    suggestions:
      "Prepare several questions about success, priorities, team dynamics, challenges, decision-making, and the role's expectations. Avoid questions answered clearly by the job description.",
  },
];
