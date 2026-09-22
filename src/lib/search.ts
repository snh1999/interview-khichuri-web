import MiniSearch from "minisearch";
import type { IJob } from "@/api/jobs";
import type { IPrepSession } from "@/api/sessions";
import {
  type IQuestionBankItem,
  QUESTION_BANK,
} from "@/lib/questions/question-bank.ts";

export interface TSearchResult<T> {
  id: string;
  score: number;
  terms: string[];
  doc: T;
}

export interface ISearchOptions {
  prefix?: boolean;
  fuzzy?: boolean | number;
  combineWith?: "or" | "and" | "and_not";
  limit?: number;
}

export interface ICreateSearchOptions<
  T extends { id: string },
  K extends keyof T & string,
> extends ISearchOptions {
  preset?: keyof typeof SEARCH_PRESETS;
  weights?: Partial<Record<K, number>>;
}

export const DEFAULT_SEARCH_OPTIONS = {
  prefix: true,
  fuzzy: false,
  combineWith: "or",
  limit: 50,
} as const;

export const SEARCH_PRESETS = {
  content: { prefix: true, fuzzy: 0.2 },
  labels: { prefix: true, fuzzy: false },
} as const;

export const createSearch = <
  T extends { id: string },
  K extends keyof T & string,
>(
  docs: readonly T[],
  fields: readonly K[],
  options: ICreateSearchOptions<T, K> = {}
) => {
  const preset = SEARCH_PRESETS[options.preset ?? "content"];
  const weights = Object.fromEntries(
    fields.map((field) => [field, options.weights?.[field] ?? 1])
  );
  const miniSearch = new MiniSearch<T>({
    idField: "id",
    fields: [...fields],
    searchOptions: {
      prefix: options.prefix ?? preset.prefix,
      fuzzy: options.fuzzy ?? preset.fuzzy,
      combineWith: options.combineWith ?? DEFAULT_SEARCH_OPTIONS.combineWith,
      boost: weights,
    },
  });
  miniSearch.addAll(docs);

  const docsById = new Map(docs.map((doc) => [doc.id, doc]));

  return {
    search: (query: string, overrides: ISearchOptions = {}) => {
      const trimmed = query.trim();
      const limit =
        overrides.limit ?? options.limit ?? DEFAULT_SEARCH_OPTIONS.limit;
      if (trimmed.length === 0) {
        return docs
          .slice(0, limit)
          .map((doc) => ({ id: doc.id, score: 0, terms: [], doc }));
      }
      return miniSearch
        .search(trimmed, {
          prefix: overrides.prefix ?? options.prefix ?? preset.prefix,
          fuzzy: overrides.fuzzy ?? options.fuzzy ?? preset.fuzzy,
          combineWith:
            overrides.combineWith ??
            options.combineWith ??
            DEFAULT_SEARCH_OPTIONS.combineWith,
          boost: weights,
        })
        .slice(0, limit)
        .map((result) => {
          const doc = docsById.get(result.id);
          return doc === undefined
            ? null
            : {
                id: result.id,
                score: result.score,
                terms: result.terms,
                doc,
              };
        })
        .filter((result): result is TSearchResult<T> => result !== null);
    },
  };
};

export const createQuestionBankSearch = () =>
  createSearch<IQuestionBankItem, "questions">(QUESTION_BANK, ["questions"], {
    preset: "content",
  });

export const createJobSearch = (jobs: readonly IJob[]) =>
  createSearch<IJob, "title" | "companyName">(jobs, ["title", "companyName"], {
    limit: jobs.length,
    preset: "content",
  });

// TODO(search-job-labels): index the job label (e.g. "Role name @ company") in the session search.
// Expected format: resolve labels through a global job lookup map (like useLookupMap)
// then add `jobLabel` to the document below and index `"jobLabel"` in the fields list.
export const createSessionSearch = (
  sessions: readonly IPrepSession[],
  roleName: (roleId?: number | null) => string | undefined
) =>
  createSearch(
    sessions.map((session) => ({
      id: session.id,
      title: session.title,
      description: session.description ?? "",
      role: roleName(session.roleId) ?? "",
    })),
    ["title", "description", "role"],
    { preset: "content", limit: sessions.length }
  );
