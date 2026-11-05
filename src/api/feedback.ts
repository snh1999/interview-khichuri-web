import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client.ts";

export const FEEDBACK_REPORT_TYPES = ["bug", "feedback"] as const;
export type TFeedbackReportType = (typeof FEEDBACK_REPORT_TYPES)[number];

export interface ICreateFeedbackInput {
  type: TFeedbackReportType;
  message: string;
  route: string;
}

export const useCreateFeedback = () =>
  useMutation({
    mutationFn: async (input: ICreateFeedbackInput) =>
      await api.post<{ id: string }>("/feedback", input),
  });
