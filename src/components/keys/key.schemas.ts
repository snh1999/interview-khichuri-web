import { z } from "zod";
import type { TApiKeyProvider } from "@/api/keys";
import { MAX_URL_LENGTH } from "@/app.constants.ts";

export const MODEL_PLACEHOLDER = "e.g. gemini-2.0-flash";

const BASE_URL_PLACEHOLDERS: Partial<Record<TApiKeyProvider, string>> = {
  cloudflare:
    "https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/v1",
};

export const getBaseUrlPlaceholder = (provider: TApiKeyProvider) =>
  BASE_URL_PLACEHOLDERS[provider] ?? "https://api.example.com/v1";

export const baseUrlSchema = z
  .string()
  .max(MAX_URL_LENGTH)
  .optional()
  .refine(
    (value) => !value || value.startsWith("https://"),
    "Base URL must use HTTPS"
  );

export const requireBaseUrl = (
  data: { baseUrl?: string },
  context: z.RefinementCtx
) => {
  if (!data.baseUrl?.trim()) {
    context.addIssue({
      code: "custom",
      message: "Base URL is required for this provider",
      path: ["baseUrl"],
    });
  }
};
