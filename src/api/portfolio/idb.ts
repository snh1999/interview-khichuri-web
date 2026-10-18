import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient, queryKeys } from "@/api";
import {
  buildDuplicatedPortfolio,
  buildNewPortfolio,
  extractAllValidAssetIds,
  type IBuildNewPortfolioInput,
  normalizeImportedPortfolio,
} from "@/components/portfolio/portfolio.helpers";
import type { Portfolio } from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios";
import { cleanupOrphanAssetImages } from "@/lib/storage/imageStorageDb";
import {
  deleteStoredRow,
  getActiveUserId,
  getPortfolio,
  getPortfolios,
  putPortfolio,
} from "@/lib/storage/portfolioDb";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import { useBuilderStore } from "@/store/useBuilderStore";

/**
 * react-query over the `portfolios` IndexedDB rows: records + CRUD live here,
 * mirroring `api/resumes/idb.ts` and `api/sessions/interviews.ts`. The live
 * canvas editing buffer stays in `sketchBuilderStore`, flushed by
 * `usePersistDraft`.
 */

export const usePortfolios = () =>
  useQuery({
    queryKey: queryKeys.portfolio.list(),
    queryFn: async () => await getPortfolios(),
  });

export const usePortfolio = (id?: string) =>
  useQuery({
    queryKey: queryKeys.portfolio.detail(id ?? ""),
    queryFn: async () => await getPortfolio(id ?? ""),
    enabled: !!id,
  });

export const useCreatePortfolio = () =>
  useMutation({
    mutationFn: async (input: IBuildNewPortfolioInput = {}) => {
      const record = buildNewPortfolio(input);
      await putPortfolio(record);
      return record;
    },
    onMutate: () => getActiveUserId(),
    onSuccess: (record, _input, owner) => {
      if (owner !== getActiveUserId()) {
        return;
      }
      apiClient.setQueryData<Portfolio[]>(
        queryKeys.portfolio.list(),
        (prev) => [...(prev ?? []), record]
      );
      apiClient.setQueryData(queryKeys.portfolio.detail(record.id), record);
    },
  });

export const useUpdatePortfolio = () =>
  useMutation({
    mutationFn: async (record: Portfolio) => {
      await putPortfolio(record);
      return record;
    },
    onMutate: () => getActiveUserId(),
    onSuccess: (record, _variables, owner) => {
      if (owner !== getActiveUserId()) {
        return;
      }
      apiClient.setQueryData(queryKeys.portfolio.detail(record.id), record);
      apiClient.setQueryData<Portfolio[]>(queryKeys.portfolio.list(), (prev) =>
        prev?.map((p) => (p.id === record.id ? record : p))
      );
    },
  });

export const useDeletePortfolio = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await deleteStoredRow("portfolios", id);
      return id;
    },
    onMutate: () => getActiveUserId(),
    onSuccess: async (id, _variables, owner) => {
      if (owner !== getActiveUserId()) {
        return;
      }
      // The portfolio's code project goes with it.
      useBuilderStore.getState().dropProject(id);
      apiClient.removeQueries({ queryKey: queryKeys.portfolio.detail(id) });

      const { clipboard, history } = useSketchBuilderStore.getState();
      let remaining: Portfolio[];
      try {
        remaining = await getPortfolios();
      } catch {
        // The read failed — do not run the orphan sweep against a false empty
        // list; drop the deleted row from the cache and leave images alone.
        apiClient.setQueryData<Portfolio[]>(
          queryKeys.portfolio.list(),
          (prev) => prev?.filter((p) => p.id !== id)
        );
        return;
      }
      if (owner !== getActiveUserId()) {
        return;
      }
      await cleanupOrphanAssetImages(
        extractAllValidAssetIds(remaining, clipboard, history)
      );
      apiClient.setQueryData<Portfolio[]>(
        queryKeys.portfolio.list(),
        remaining
      );
    },
  });

export const useDuplicatePortfolio = () =>
  useMutation({
    mutationFn: async ({
      id,
      copyCode,
    }: {
      id: string;
      copyCode?: boolean;
    }) => {
      const owner = getActiveUserId();
      const target = await getPortfolio(id);
      if (!target) {
        throw new Error("Portfolio not found");
      }
      const clone = await buildDuplicatedPortfolio(target);
      if (owner !== getActiveUserId()) {
        throw new Error("Account changed while duplicating");
      }
      await putPortfolio(clone);
      return { clone, copyCode: Boolean(copyCode), sourceId: id };
    },
    onMutate: () => getActiveUserId(),
    onSuccess: ({ clone, copyCode, sourceId }, _input, owner) => {
      if (owner !== getActiveUserId()) {
        return;
      }
      // Opt-in: carry the source portfolio's code project over to the copy.
      if (copyCode) {
        useBuilderStore.getState().cloneProject(sourceId, clone.id);
      }
      apiClient.setQueryData<Portfolio[]>(
        queryKeys.portfolio.list(),
        (prev) => [...(prev ?? []), clone]
      );
      apiClient.setQueryData(queryKeys.portfolio.detail(clone.id), clone);
    },
  });

export const useImportPortfolio = () =>
  useMutation({
    mutationFn: async (imported: unknown) => {
      const owner = getActiveUserId();
      const incomingId = (imported as { id?: string } | null)?.id;
      const existing = incomingId ? await getPortfolio(incomingId) : null;
      const record = normalizeImportedPortfolio(
        imported,
        DEFAULT_THEMES[0],
        Boolean(existing)
      );
      if (!record) {
        throw new Error("Invalid portfolio");
      }
      if (owner !== getActiveUserId()) {
        throw new Error("Account changed while importing");
      }
      await putPortfolio(record);
      return record;
    },
    onMutate: () => getActiveUserId(),
    onSuccess: (record, _imported, owner) => {
      if (owner !== getActiveUserId()) {
        return;
      }
      apiClient.setQueryData<Portfolio[]>(
        queryKeys.portfolio.list(),
        (prev) => [...(prev ?? []), record]
      );
      apiClient.setQueryData(queryKeys.portfolio.detail(record.id), record);
    },
  });

/**
 * Subscribes to the editor store's `draft` and writes each change to IDB.
 * Mounted once by the editor page; the subscription only fires when the draft
 * object is replaced (not on unrelated UI state).
 */
export const usePersistDraft = () => {
  const { mutate } = useUpdatePortfolio();
  useEffect(() => {
    let last = useSketchBuilderStore.getState().draft;
    return useSketchBuilderStore.subscribe((state) => {
      if (state.draft && state.draft !== last) {
        last = state.draft;
        mutate(state.draft);
      }
    });
  }, [mutate]);
};

/**
 * Drops IDB assets no portfolio references. Runs once per editor mount so the
 * editor store — which no longer owns the collection — never has to judge
 * orphaning against a single portfolio and risk deleting another's blobs.
 */
export const useCollectOrphanAssets = () => {
  useEffect(() => {
    const collect = async () => {
      const owner = getActiveUserId();
      const portfolios = await getPortfolios();
      if (owner !== getActiveUserId()) {
        return;
      }
      await cleanupOrphanAssetImages(extractAllValidAssetIds(portfolios));
    };
    collect().catch(() => undefined);
  }, []);
};
