// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useMemo } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Resolvers for the mocked, manually-settled storage calls.
const { pendingGets, pendingLists, pendingPuts } = vi.hoisted(() => ({
  pendingGets: [] as Array<() => void>,
  pendingLists: [] as Array<() => void>,
  pendingPuts: [] as Array<() => void>,
}));

vi.mock("@/lib/storage/portfolioDb", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/storage/portfolioDb")>();
  return {
    ...actual,
    deleteStoredRow: vi.fn(async () => undefined),
    getPortfolio: vi.fn(
      () =>
        new Promise((resolve) => {
          pendingGets.push(() => resolve({ id: "src", title: "S" }));
        })
    ),
    getPortfolios: vi.fn(
      () =>
        new Promise((resolve) => {
          pendingLists.push(() => resolve([]));
        })
    ),
    putPortfolio: vi.fn(
      () =>
        new Promise<void>((resolve) => {
          pendingPuts.push(resolve);
        })
    ),
  };
});

vi.mock("@/components/portfolio/portfolio.helpers", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/components/portfolio/portfolio.helpers")
    >();
  return {
    ...actual,
    buildDuplicatedPortfolio: vi.fn(async () => ({
      id: "copy",
      title: "Copy",
    })),
  };
});

vi.mock("@/lib/storage/imageStorageDb", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/storage/imageStorageDb")>();
  return { ...actual, cleanupOrphanAssetImages: vi.fn(async () => undefined) };
});

import { apiClient, queryKeys } from "@/api";
import {
  useCreatePortfolio,
  useDeletePortfolio,
  useDuplicatePortfolio,
  useImportPortfolio,
} from "@/api/portfolio/idb";
import { cleanupOrphanAssetImages } from "@/lib/storage/imageStorageDb";
import { getPortfolios, setActiveUserId } from "@/lib/storage/portfolioDb";

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: { retry: false },
          queries: { retry: false },
        },
      }),
    []
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => {
  pendingGets.length = 0;
  pendingLists.length = 0;
  pendingPuts.length = 0;
  apiClient.clear();
  vi.clearAllMocks();
});

describe("portfolio mutations across an account switch", () => {
  it("does not write the previous account's record into the next account's cache", async () => {
    setActiveUserId("user-a");
    const { result } = renderHook(() => useCreatePortfolio(), { wrapper });

    act(() => {
      result.current.mutate({ title: "Stale" });
    });
    // The write is in flight; `onMutate` has already captured "user-a".
    await waitFor(() => expect(pendingPuts).toHaveLength(1));

    // The account switches and the query cache is cleared mid-write.
    apiClient.clear();
    setActiveUserId("user-b");

    await act(async () => {
      for (const resolve of pendingPuts) {
        resolve();
      }
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.getQueryData(queryKeys.portfolio.list())).toBeUndefined();
  });

  it("does not persist a duplicate into the next account when the owner changed", async () => {
    setActiveUserId("user-a");
    const { result } = renderHook(() => useDuplicatePortfolio(), { wrapper });

    act(() => {
      result.current.mutate({ id: "src" });
    });
    await waitFor(() => expect(pendingGets).toHaveLength(1));

    // The account switches while the source is still being read.
    setActiveUserId("user-b");

    await act(async () => {
      for (const resolve of pendingGets) {
        resolve();
      }
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(pendingPuts).toHaveLength(0);
  });

  it("does not clean up the next account's assets when the owner changed mid-delete", async () => {
    setActiveUserId("user-a");
    const { result } = renderHook(() => useDeletePortfolio(), { wrapper });

    act(() => {
      result.current.mutate("p1");
    });
    // `onSuccess` passed its first owner check and is now reading the list.
    await waitFor(() => expect(pendingLists).toHaveLength(1));

    setActiveUserId("user-b");

    await act(async () => {
      for (const resolve of pendingLists) {
        resolve();
      }
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cleanupOrphanAssetImages).not.toHaveBeenCalled();
  });

  it("does not persist an import into the next account when the owner changed", async () => {
    setActiveUserId("user-a");
    const { result } = renderHook(() => useImportPortfolio(), { wrapper });

    act(() => {
      result.current.mutate({ id: "src", title: "S" });
    });
    await waitFor(() => expect(pendingGets).toHaveLength(1));

    setActiveUserId("user-b");

    await act(async () => {
      for (const resolve of pendingGets) {
        resolve();
      }
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(pendingPuts).toHaveLength(0);
  });

  it("skips the orphan sweep when the portfolio read fails", async () => {
    vi.mocked(getPortfolios).mockRejectedValueOnce(new Error("db down"));
    setActiveUserId("user-a");
    const { result } = renderHook(() => useDeletePortfolio(), { wrapper });

    act(() => {
      result.current.mutate("p1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cleanupOrphanAssetImages).not.toHaveBeenCalled();
  });
});
