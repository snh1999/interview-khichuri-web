import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const TECHNICAL_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "technical-background",
    category: "technical",
    questions: [
      "Tell me about your technical background.",
      "What technical skills do you bring?",
      "Which technical areas are you strongest in?",
      "Walk me through your technical experience.",
    ],
    suggestions:
      "Prioritize skills relevant to the role and give evidence of practical use. Distinguish confidently between skills you use regularly and those you only know at a basic level.",
  },
  {
    id: "learning-technical",
    category: "technical",
    questions: [
      "How do you learn a new technology or tool?",
      "How do you get up to speed with unfamiliar technical concepts?",
      "Describe your process for learning a new technical skill.",
      "How do you keep your technical knowledge current?",
    ],
    suggestions:
      "Explain a practical learning loop: understand the fundamentals, consult reliable documentation or examples, practice, build or test something, and validate your understanding.",
  },
  {
    id: "technical-tradeoff",
    category: "technical",
    questions: [
      "Tell me about a technical tradeoff you made.",
      "Describe a technical decision where you had to compromise.",
      "How do you balance simplicity, performance, cost, and maintainability?",
      "Tell me about a technical decision with competing constraints.",
    ],
    suggestions:
      "Explain the requirements and constraints, the alternatives you considered, why you chose one, and what downside you knowingly accepted.",
  },
  {
    id: "debugging",
    category: "technical",
    questions: [
      "How do you approach debugging a difficult problem?",
      "Walk me through your debugging process.",
      "Tell me about a hard technical issue you diagnosed.",
      "What do you do when you can't immediately find the cause of a technical problem?",
    ],
    suggestions:
      "Start by reproducing and narrowing the problem, gather evidence, form testable hypotheses, change one variable at a time where practical, and verify the fix.",
  },
  {
    id: "quality",
    category: "technical",
    questions: [
      "How do you ensure the quality of your technical work?",
      "What does good technical quality mean to you?",
      "How do you prevent defects?",
      "How do you verify that your work is correct?",
    ],
    suggestions:
      "Discuss appropriate practices such as testing, review, validation, monitoring, documentation, and risk-based checks. Tailor the depth to the role.",
  },
  {
    id: "technical-debt",
    category: "technical",
    questions: [
      "How do you handle technical debt?",
      "Tell me about a time you had to work with legacy systems or technical debt.",
      "When is it worth paying down technical debt?",
      "How do you balance new work with maintenance?",
    ],
    suggestions:
      "Explain how you evaluate risk, cost, frequency of change, and business impact. Avoid treating all debt as equally urgent.",
  },
  {
    id: "security-awareness",
    category: "technical",
    questions: [
      "How do you think about security in your work?",
      "Tell me about a security consideration you had to account for.",
      "What security principles do you consider when building or operating systems?",
      "How do you avoid introducing security risks?",
    ],
    suggestions:
      "Focus on role-relevant fundamentals such as access control, data protection, input validation, secrets, least privilege, and secure defaults.",
  },
  {
    id: "technical-communication",
    category: "technical",
    questions: [
      "How do you explain technical decisions to non-technical stakeholders?",
      "Tell me about communicating a technical issue to a non-technical audience.",
      "How do you discuss technical tradeoffs with business stakeholders?",
      "How do you make technical information understandable?",
    ],
    suggestions:
      "Start with the decision or impact the audience cares about, then explain only the technical detail needed to support the decision.",
  },
  {
    id: "technical-incident",
    category: "technical",
    questions: [
      "Tell me about a technical incident you handled.",
      "Describe a production or operational problem you had to respond to.",
      "How do you respond when a technical system fails?",
      "Tell me about a serious technical issue and what you did.",
    ],
    suggestions:
      "Explain how you stabilized the situation, communicated impact, diagnosed the cause, restored service or function, and captured follow-up improvements.",
  },
  {
    id: "architecture-experience",
    category: "technical",
    questions: [
      "Tell me about a system or solution you helped design.",
      "Describe an architecture you worked on.",
      "What is the most complex system you've worked with?",
      "Walk me through a technical system you designed or significantly changed.",
    ],
    suggestions:
      "Explain requirements, major components, important decisions, constraints, and tradeoffs at a level appropriate to the interviewer. Be clear about what you personally owned.",
  },
];
