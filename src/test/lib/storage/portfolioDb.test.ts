// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import type { Portfolio } from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios";
import {
  createPortfolioStorage,
  deleteStoredRow,
  getPortfolio,
  getPortfolios,
  putPortfolio,
  setActiveUserId,
} from "@/lib/storage/portfolioDb";

const portfolio = (id: string): Portfolio => ({
  id,
  title: id,
  description: "",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  elements: [],
  moodboard: [],
  theme: { ...DEFAULT_THEMES[0] },
  generatedDesigns: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

// Each test writes as a fresh user so rows can't bleed between tests (the DB is
// shared across the file).
let userSeq = 0;
const user = () => {
  userSeq += 1;
  return `pdb-${userSeq}`;
};

beforeEach(() => {
  localStorage.clear();
});

describe("portfolioDb accessors", () => {
  it("round-trips a portfolio for the active user", async () => {
    setActiveUserId(user());
    await putPortfolio(portfolio("p1"));

    expect(await getPortfolio("p1")).toMatchObject({ id: "p1", title: "p1" });
    expect((await getPortfolios()).map((p) => p.id)).toEqual(["p1"]);
  });

  it("never persists transient generated designs", async () => {
    setActiveUserId(user());
    await putPortfolio({
      ...portfolio("p1"),
      generatedDesigns: [{ id: "d1" }] as never,
    });

    expect((await getPortfolio("p1"))?.generatedDesigns).toEqual([]);
  });

  it("isolates rows per user", async () => {
    const a = user();
    const b = user();
    setActiveUserId(a);
    await putPortfolio(portfolio("pa"));

    setActiveUserId(b);
    expect(await getPortfolio("pa")).toBeNull();
    expect(await getPortfolios()).toEqual([]);
    await putPortfolio(portfolio("pb"));

    setActiveUserId(a);
    expect((await getPortfolios()).map((p) => p.id)).toEqual(["pa"]);
  });

  it("deleteStoredRow removes only the targeted row", async () => {
    setActiveUserId(user());
    await putPortfolio(portfolio("p1"));
    await putPortfolio(portfolio("p2"));

    await deleteStoredRow("portfolios", "p1");

    expect((await getPortfolios()).map((p) => p.id)).toEqual(["p2"]);
  });

  it("degrades to empty reads and dropped writes with no active user", async () => {
    setActiveUserId(undefined);
    await expect(putPortfolio(portfolio("p1"))).resolves.toBeUndefined();
    await expect(deleteStoredRow("portfolios", "p1")).resolves.toBeUndefined();

    expect(await getPortfolio("p1")).toBeNull();
    expect(await getPortfolios()).toEqual([]);
  });

  it("rejects a failed write instead of reporting success", async () => {
    setActiveUserId(user());
    // A function value can't be structured-cloned, so the put rejects.
    await expect(
      putPortfolio({ ...portfolio("bad"), bad: () => undefined } as never)
    ).rejects.toThrow();

    // One bad write must not poison the queue.
    await putPortfolio(portfolio("good"));
    expect((await getPortfolios()).map((p) => p.id)).toEqual(["good"]);
  });
});

interface IBuilderState {
  projects: Record<
    string,
    { portfolioId: string; files: Record<string, string> }
  >;
}

describe("portfolioDb builder project storage", () => {
  it("round-trips code projects for the active user", async () => {
    setActiveUserId(user());
    const storage = createPortfolioStorage<IBuilderState>({
      store: "builderProjects",
      version: 0,
      items: (state) =>
        Object.entries(state.projects).map(([portfolioId, project]) => ({
          ...project,
          portfolioId,
        })) as unknown as Record<string, unknown>[],
      prefs: () => ({}),
      merge: (items) => ({
        projects: Object.fromEntries(
          items.map((item) => [
            item.portfolioId as string,
            item as unknown as IBuilderState["projects"][string],
          ])
        ),
      }),
    });

    await storage.setItem("n", {
      state: {
        projects: { p1: { portfolioId: "p1", files: { "/App.js": "code" } } },
      },
      version: 0,
    });

    const restored = await storage.getItem("n");
    expect(restored?.state.projects.p1?.files["/App.js"]).toBe("code");
    expect(restored?.version).toBe(0);
  });
});

interface ISimpleState {
  items: { id: string }[];
  pane: string;
}

const simpleCodec = () => ({
  store: "portfolios" as const,
  version: 3,
  items: (state: ISimpleState) =>
    state.items as unknown as Record<string, unknown>[],
  prefs: (state: ISimpleState) => ({ pane: state.pane }),
  merge: (
    items: Record<string, unknown>[],
    prefs: Record<string, unknown> | null
  ): ISimpleState => ({
    items: items as unknown as { id: string }[],
    pane: (prefs as { pane?: string } | null)?.pane ?? "",
  }),
});

const simpleSnapshot = (ids: string[], pane: string) => ({
  state: { items: ids.map((id) => ({ id })), pane },
  version: 3,
});

describe("portfolioDb persist storage edge cases", () => {
  it("clears every row and pref for the active user on removeItem", async () => {
    setActiveUserId(user());
    const storage = createPortfolioStorage<ISimpleState>(simpleCodec());
    await storage.setItem("n", simpleSnapshot(["p1", "p2"], "x"));

    await storage.removeItem("n");

    expect(await storage.getItem("n")).toBeNull();
    expect(await getPortfolios()).toEqual([]);
  });

  it("returns null when nothing is stored", async () => {
    setActiveUserId(user());
    const storage = createPortfolioStorage<ISimpleState>(simpleCodec());
    expect(await storage.getItem("n")).toBeNull();
  });

  it("drops reads and writes with no active user", async () => {
    setActiveUserId(undefined);
    const storage = createPortfolioStorage<ISimpleState>(simpleCodec());

    expect(await storage.getItem("n")).toBeNull();
    await expect(
      storage.setItem("n", simpleSnapshot(["p1"], "x"))
    ).resolves.toBeUndefined();
    await expect(storage.removeItem("n")).resolves.toBeUndefined();
  });
});
