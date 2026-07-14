import type { TApiKeyProvider } from "@/api/keys";

export interface IProviderInfo {
  name: string;
  getApiKeyUrl: string;
  getApiKeySteps: string[];
  pros: string[];
  cons: string[];
  freeTier: string;
  freeTierLimits: {
    rpm: number; // requests per minute
    rpd: number; // requests per day
    tpm?: number; // tokens per minute
    contextWindow?: number; // max context tokens (model capability, not API cap)
    notes: string;
  };
  privacyNote: string;
  privacyPolicyUrl: string;
  benchmarkUrl?: string;
}

export const PROVIDER_INFO: Record<TApiKeyProvider, IProviderInfo> = {
  google: {
    name: "Google AI Studio (Gemini)",
    getApiKeyUrl: "https://aistudio.google.com/app/apikey",
    getApiKeySteps: [
      "Go to Google AI Studio (aistudio.google.com)",
      "Sign in with a Google account",
      "Click 'Get API key' > 'Create API key'",
      "Pick or create a Google Cloud project to attach the key to",
    ],
    pros: [
      "Best free daily volume of any major provider",
      "1M-token context window standard on Flash/Pro models; good for long documents",
      "Native multimodal support (images, audio, video, PDFs)",
    ],
    cons: [
      "Free-tier prompts/outputs may be used by Google to improve its products, consider other providers if that's a dealbreaker",
      "Quota is per Google Cloud project, not per key: extra keys in the same project share the same limit",
      "Limits were tightened significantly in Dec 2025–Apr 2026; always check the live number in AI Studio rather than a remembered figure",
    ],
    freeTier:
      "Quota is per Cloud project, not per API key; No card required. Flash/Flash-Lite: ~15 RPM, ~1,500 RPD, ~1M TPM. Gemini Pro on free tier is far more restricted (roughly 2 RPM / 50 RPD).",
    freeTierLimits: {
      rpm: 15,
      rpd: 1500,
      tpm: 1_000_000,
      contextWindow: 1_048_576,
      notes:
        "Figures are for Flash/Flash-Lite. Pro models on free tier: ~2 RPM / ~50 RPD.",
    },
    privacyNote:
      "On the free tier, Google may save and use your prompts/outputs to improve its products. This does NOT apply in the EU/UK/EEA. Paid API usage and Vertex AI are not used for training by default.",
    privacyPolicyUrl: "https://ai.google.dev/gemini-api/terms",
    benchmarkUrl: "https://lmarena.ai/",
  },

  openai: {
    name: "OpenAI",
    getApiKeyUrl: "https://platform.openai.com/api-keys",
    getApiKeySteps: [
      "Log in to platform.openai.com (separate from a ChatGPT subscription, Plus/Pro credit does not carry over)",
      "Go to Settings > API Keys",
      "Click 'Create new secret key'",
      "Add a payment method under Settings > Billing to actually use most models",
    ],
    pros: [
      "Broadest model ecosystem and most mature tooling (SDKs, Responses/Assistants API, huge third-party support)",
      "Reliable uptime and predictable, well-documented API behavior",
      "API data is not used for model training by default; Zero Data Retention available for eligible orgs",
    ],
    cons: [
      "No free trial credit, the old automatic $5–$18 signup credit was discontinued in 2025",
      "A payment method is effectively required; the only card-free path is a very restrictive free-usage tier that most of the models mark as 'not supported'",
    ],
    freeTier:
      "No free tier in practice, effectively requires adding billing to use most models. An opt-in 'free tokens for data sharing' (no opt-out) option exists.",
    freeTierLimits: {
      rpm: 0,
      rpd: 0,
      tpm: 0,
      contextWindow: 128_000,
      notes:
        "After adding a payment method, limits are 500 RPM for GPT-4o-mini, 3 RPM for reasoning models.",
    },
    privacyNote:
      "API inputs/outputs are not used for model training by default and can be retained for up to 30 days (shorter/zero via Zero Data Retention for eligible use cases). Optional data-sharing program grants 1M–10M free tokens/day in exchange for allowing training use. This is separate from ChatGPT consumer-app settings.",
    privacyPolicyUrl: "https://openai.com/enterprise-privacy",
    benchmarkUrl: "https://lmarena.ai/",
  },

  groq: {
    name: "Groq",
    getApiKeyUrl: "https://console.groq.com/keys",
    getApiKeySteps: [
      "Sign up at console.groq.com with an email or Google account",
      "Open the API Keys section",
      "Click 'Create API Key'",
    ],
    pros: [
      "The fastest inference of any listed provider (custom LPU hardware; hundreds to ~2,500+ tokens/sec depending on model)",
      "Genuinely free, no-credit-card tier with access to every model Groq hosts",
      "Does not train on customer API data by default; self-serve Zero Data Retention available",
    ],
    cons: [
      "Open-weight models only (Llama, Qwen, DeepSeek-distill, GPT-OSS, etc.) but no GPT, Claude, or Gemini",
      "Free-tier request/token caps vary meaningfully by model. The token-per-minute limit is usually the binding constraint on long prompts, not the request count",
      "Limits apply at the organization level, not per key; creating extra keys doesn't add quota, and ToS forbids creating extra accounts to get around this",
    ],
    freeTier:
      "No card required. Typical caps (vary by model): ~30 requests/min, ~1,000 requests/day, with per-model token/minute limits. Adding a card unlocks the Developer tier (~10x the limits plus a discount) at no minimum spend.",
    freeTierLimits: {
      rpm: 30,
      rpd: 1000,
      tpm: 6000,
      contextWindow: 128_000,
      notes:
        "Limits are org-level (varies by model), not per key. TPM is the constraint for long prompts.",
    },
    privacyNote:
      "Groq states it does not train on customer API (Cloud Services) data by default; Zero Data Retention is self-serve in Console settings for all tiers. This is governed by the Groq Services Agreement, separate from the general website privacy policy.",
    privacyPolicyUrl: "https://groq.com/privacy-policy/",
    benchmarkUrl: "https://artificialanalysis.ai/providers/groq",
  },

  openrouter: {
    name: "OpenRouter",
    getApiKeyUrl: "https://openrouter.ai/keys",
    getApiKeySteps: [
      "Create an account at openrouter.ai",
      "Go to the Keys page",
      "Click 'Create Key'",
      "Use a model ID ending in ':free' to stay on the no-cost tier",
    ],
    pros: [
      "One API key and one OpenAI-compatible endpoint in front of 400+ models from dozens of providers, including 25+ free (':free') variants",
      "Automatic fallback/routing across underlying providers if one is down or overloaded",
      "No markup on paid models, pay the same per-token rate the underlying provider charges, plus a one-time fee when purchasing credits",
      "BYOK program: 1M free routing requests/month using your own provider keys",
    ],
    cons: [
      "Free (':free') models are capped at 20 requests/minute and 50 requests/day",
      "Failed/rate-limited requests still count against the daily free quota",
      "The specific free models available/context window rotate over time without notice",
    ],
    freeTier:
      "No card required for free-tagged models (low priority routing). Limit raises permanently to 1,000/day after a one-time $10+ credit purchase. BYOK: 1M free routing requests/month. Paid models have no OpenRouter-imposed rate limit, only whatever the underlying provider enforces.",
    freeTierLimits: {
      rpm: 20,
      rpd: 50,
      contextWindow: 1_000_000,
      notes:
        "Figure for unfunded accounts. 1,000 RPD after $10 lifetime spend. TPM varies by provider.",
    },
    privacyNote:
      "OpenRouter states it does not log prompts/completions by default; you can restrict routing to zero data retention providers in privacy settings. For paid models, privacy ultimately depends on whichever underlying provider handles the request.",
    privacyPolicyUrl: "https://openrouter.ai/privacy",
    benchmarkUrl: "https://openrouter.ai/models",
  },

  mistral: {
    name: "Mistral AI",
    getApiKeyUrl: "https://console.mistral.ai/api-keys",
    getApiKeySteps: [
      "Sign up at console.mistral.ai",
      "Verify with a phone number (required even for the free tier)",
      "Go to API Keys and click 'Create new key'",
    ],
    pros: [
      "One of the most aggressively priced APIs available: Mistral Small starts around $0.03–$0.10 per million input tokens",
      "EU-based (Paris) infrastructure by default, useful for GDPR/data-residency requirements",
      "A genuinely free 'Experiment' plan gives rate-limited access to the full model lineup, including Mistral Large and Codestral, not just a cut-down small model",
      "States it does not use API data for training by default; data sharing can be disabled in Privacy settings",
    ],
    cons: [
      "Phone number verification is required to activate even the free tier",
      "Mistral does not publishe exact free-tier numeric limits, check the live 'Limits' page in your account after signing up",
      "Smaller ecosystem/community, the free tier is explicitly positioned for evaluation rather than any real traffic",
    ],
    freeTier:
      "Free 'Experiment' mode (phone verification required, no card): rate-limited access to the full model lineup. Exact numeric limits not published, check account's Limits page.",
    freeTierLimits: {
      rpm: 1,
      rpd: 0,
      tpm: 0,
      contextWindow: 256_000,
      notes: "~1 req/sec reported by community. No official published limits.",
    },
    privacyNote:
      "Mistral states it does not use API data for training by default. You can also disable data sharing for product-improvement purposes in account Privacy settings on any tier. Paid tiers offer additional data residency options.",
    privacyPolicyUrl: "https://mistral.ai/terms/#privacy-policy",
    benchmarkUrl: "https://lmarena.ai/",
  },

  cerebras: {
    name: "Cerebras",
    getApiKeyUrl: "https://cloud.cerebras.ai/platform/apikeys",
    getApiKeySteps: [
      "Sign up at cloud.cerebras.ai",
      "Go to the API Keys page in the Cerebras Cloud console",
      "Click 'Create API Key'",
    ],
    pros: [
      "Extremely high throughput on its wafer-scale (WSE) hardware: vendor-reported speeds from roughly 1,000 up to 2,600+ tokens/sec depending on the model.",
      "Generous daily free volume: on the order of 1,000,000 tokens/day with no credit card.",
    ],
    cons: [
      "Open-weight models only (Llama, Qwen, GPT-OSS, DeepSeek-distill, etc.), no proprietary frontier models like GPT, Claude, or Gemini",
      "Free tier also enforces per-minute request/token caps on top of the daily cap, and context length on some free-tier models is smaller than the paid/full version",
      "Available models rotate as Cerebras adds and deprecates support, don't hard-code a dependency on one specific model staying available long-term",
    ],
    freeTier:
      "No card required: roughly 1,000,000 tokens/day, with additional per-minute request/token caps that vary by model. Resets daily (UTC) midnight. Model availability rotates; check live list in dashboard.",
    freeTierLimits: {
      rpm: 5,
      rpd: 0,
      tpm: 30_000,
      contextWindow: 8192,
      notes:
        "1M tokens/day budget. 5 RPM hard limit. Free-tier context capped at 8K tokens on some models.",
    },
    privacyNote:
      "Cerebras's general privacy policy covers its websites; API/Cloud Services usage terms are governed separately by its customer agreement; check current terms directly, as public detail on data handling for inference specifically is limited.",
    privacyPolicyUrl: "https://www.cerebras.ai/privacy-policy",
    benchmarkUrl: "https://artificialanalysis.ai/providers/cerebras",
  },
};
