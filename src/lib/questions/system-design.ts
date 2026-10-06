import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const SYSTEM_DESIGN_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "design-scalable-service",
    category: "systemDesign",
    questions: [
      "Design a scalable service for X.",
      "How would you design a system that serves a large number of users?",
      "Walk me through how you'd build a system at scale.",
      "How would you architect a high-traffic service?",
    ],
    suggestions:
      "Start with requirements and scale assumptions, then outline APIs and data flow before choosing storage, caching, queues, partitioning, and reliability mechanisms. Explain tradeoffs rather than naming technologies.",
  },
  {
    id: "design-url-shortener",
    category: "systemDesign",
    questions: [
      "Design a URL shortener.",
      "How would you build a link-shortening service?",
      "Design a service that turns long URLs into short links.",
      "How would you architect a URL shortener at scale?",
    ],
    suggestions:
      "Clarify expected traffic, link lifetime, uniqueness, redirects, analytics, and availability. Then discuss ID generation, storage, caching, abuse controls, and scaling.",
  },
  {
    id: "design-chat",
    category: "systemDesign",
    questions: [
      "Design a chat system.",
      "How would you build a real-time messaging service?",
      "Design a messaging application.",
      "How would you architect a chat platform?",
    ],
    suggestions:
      "Clarify message delivery guarantees, ordering, presence, scale, and offline behavior. Discuss connections, message storage, fan-out, delivery, and failure handling.",
  },
  {
    id: "design-file-storage",
    category: "systemDesign",
    questions: [
      "Design a file storage service.",
      "How would you build a cloud file-storage system?",
      "Design a service for uploading and downloading large files.",
      "How would you architect scalable file storage?",
    ],
    suggestions:
      "Clarify file size, durability, access patterns, sharing, and consistency. Separate metadata from large object storage and discuss uploads, downloads, authorization, and reliability.",
  },
  {
    id: "design-notification",
    category: "systemDesign",
    questions: [
      "Design a notification system.",
      "How would you build a service for email, SMS, or push notifications?",
      "Design a multi-channel notification platform.",
      "How would you architect notifications at scale?",
    ],
    suggestions:
      "Clarify channels, delivery guarantees, retries, preferences, rate limits, and ordering. Discuss queues, workers, idempotency, provider failures, and observability.",
  },
];
