// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useMemo } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  useCollectOrphanAssets,
  useCreatePortfolio,
  useDeletePortfolio,
  useDuplicatePortfolio,
  useImportPortfolio,
  usePersistDraft,
  usePortfolio,
  usePortfolios,
  useUpdatePortfolio,
} from "@/api/portfolio/idb";
import type {
  CanvasElement,
  Portfolio,
} from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios";
import { getAssetImage, saveAssetImage } from "@/lib/storage/imageStorageDb";
import {
  getPortfolio,
  putPortfolio,
  setActiveUserId,
} from "@/lib/storage/portfolioDb";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import { createEmptyProject, useBuilderStore } from "@/store/useBuilderStore";

const rect = (id: string): CanvasElement =>
  ({
    id,
    type: "rectangle",
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    zIndex: 1,
  }) as CanvasElement;

const image = (id: string, src: string): CanvasElement =>
  ({
    id,
    type: "image",
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    zIndex: 1,
    src,
  }) as CanvasElement;

const portfolio = (id: string, elements: CanvasElement[] = []): Portfolio => ({
  id,
  title: id,
  description: "",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  elements,
  moodboard: [],
  theme: { ...DEFAULT_THEMES[0] },
  generatedDesigns: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

let userSeq = 0;
beforeEach(() => {
  userSeq += 1;
  setActiveUserId(`q-${userSeq}`);
  useSketchBuilderStore.setState({ draft: null });
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
});

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

describe("portfolio idb queries", () => {
  it("lists portfolios from IndexedDB", async () => {
    await putPortfolio(portfolio("p1"));

    const { result } = renderHook(() => usePortfolios(), { wrapper });
    await waitFor(() =>
      expect(result.current.data?.map((p) => p.id)).toEqual(["p1"])
    );
  });

  it("reads a single portfolio by id", async () => {
    await putPortfolio(portfolio("p1"));

    const { result } = renderHook(() => usePortfolio("p1"), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe("p1"));
  });
});

describe("portfolio idb mutations", () => {
  it("creates a portfolio and persists it", async () => {
    const { result } = renderHook(() => useCreatePortfolio(), { wrapper });

    let created: Portfolio | undefined;
    await act(async () => {
      created = await result.current.mutateAsync({ title: "Alpha" });
    });

    expect(created?.title).toBe("Alpha");
    expect((await getPortfolio(created?.id ?? ""))?.title).toBe("Alpha");
  });

  it("updates a portfolio record", async () => {
    await putPortfolio(portfolio("p1"));
    const { result } = renderHook(() => useUpdatePortfolio(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        ...portfolio("p1"),
        title: "Renamed",
      });
    });

    expect((await getPortfolio("p1"))?.title).toBe("Renamed");
  });

  it("deletes a portfolio and drops its code project", async () => {
    await putPortfolio(portfolio("p1"));
    await putPortfolio(portfolio("p2"));
    useBuilderStore.setState({
      activePortfolioId: "p1",
      projects: { p1: createEmptyProject() },
    });

    const { result } = renderHook(() => useDeletePortfolio(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync("p1");
    });

    expect(await getPortfolio("p1")).toBeNull();
    expect(await getPortfolio("p2")).not.toBeNull();
    expect(useBuilderStore.getState().projects.p1).toBeUndefined();
  });

  it("duplicates a portfolio with a new id and cloned assets", async () => {
    const assetId = "asset-1";
    await saveAssetImage(assetId, "data:,original");
    await putPortfolio(portfolio("p1", [image("img-1", `idb://${assetId}`)]));

    const { result } = renderHook(() => useDuplicatePortfolio(), { wrapper });
    let clone: Portfolio | undefined;
    await act(async () => {
      ({ clone } = await result.current.mutateAsync({
        copyCode: false,
        id: "p1",
      }));
    });

    expect(clone?.id).not.toBe("p1");
    expect(clone?.title).toBe("p1 (Copy)");
    const clonedImage = clone?.elements[0] as { src: string };
    expect(clonedImage.src).not.toBe(`idb://${assetId}`);
    expect(await getAssetImage(clonedImage.src.replace("idb://", ""))).toBe(
      "data:,original"
    );
  });

  it("carries the code project over when copying code", async () => {
    await putPortfolio(portfolio("p1"));
    useBuilderStore.setState({
      activePortfolioId: "p1",
      projects: {
        p1: { ...createEmptyProject(), files: { "/App.js": "code" } },
      },
    });

    const { result } = renderHook(() => useDuplicatePortfolio(), { wrapper });
    let cloneId = "";
    await act(async () => {
      cloneId = (await result.current.mutateAsync({ copyCode: true, id: "p1" }))
        .clone.id;
    });

    expect(useBuilderStore.getState().projects[cloneId]?.files["/App.js"]).toBe(
      "code"
    );
  });

  it("imports a normalized portfolio", async () => {
    const { result } = renderHook(() => useImportPortfolio(), { wrapper });

    let imported: Portfolio | undefined;
    await act(async () => {
      imported = await result.current.mutateAsync({
        title: "Imported",
        elements: [rect("e1")],
      });
    });

    expect(imported?.title).toBe("Imported");
    expect(imported?.elements).toHaveLength(1);
    expect(await getPortfolio(imported?.id ?? "")).not.toBeNull();
  });

  it("imports an incoming id that collides with a stored portfolio", async () => {
    await putPortfolio(portfolio("taken"));
    const { result } = renderHook(() => useImportPortfolio(), { wrapper });

    let imported: Portfolio | undefined;
    await act(async () => {
      imported = await result.current.mutateAsync({
        id: "taken",
        title: "Clone",
      });
    });

    expect(imported?.id).not.toBe("taken");
    expect(imported?.title).toBe("Clone (Imported)");
  });

  it("does not overwrite another account's portfolio when importing a colliding id", async () => {
    setActiveUserId("user-a");
    await putPortfolio(portfolio("shared"));

    setActiveUserId("user-b");
    const { result } = renderHook(() => useImportPortfolio(), { wrapper });

    let imported: Portfolio | undefined;
    await act(async () => {
      imported = await result.current.mutateAsync({
        id: "shared",
        title: "Clone",
      });
    });

    expect(imported?.id).not.toBe("shared");

    setActiveUserId("user-a");
    const afterA = await getPortfolio("shared");
    expect(afterA?.title).toBe("shared");
  });

  it("rejects an invalid import", async () => {
    const { result } = renderHook(() => useImportPortfolio(), { wrapper });

    await expect(
      act(async () => {
        await result.current.mutateAsync(null);
      })
    ).rejects.toThrow("Invalid portfolio");
  });
});

describe("usePersistDraft", () => {
  it("writes each draft change back to IndexedDB", async () => {
    renderHook(() => usePersistDraft(), { wrapper });

    act(() => {
      useSketchBuilderStore.getState().setDraft(portfolio("p1"));
    });

    await waitFor(async () =>
      expect((await getPortfolio("p1"))?.title).toBe("p1")
    );
  });
});

describe("useCollectOrphanAssets", () => {
  it("drops assets no portfolio references", async () => {
    await saveAssetImage("orphan", "data:,orphan");

    renderHook(() => useCollectOrphanAssets(), { wrapper });

    await waitFor(async () => expect(await getAssetImage("orphan")).toBeNull());
  });
});
