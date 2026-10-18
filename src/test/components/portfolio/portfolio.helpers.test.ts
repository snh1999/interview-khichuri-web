// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  buildDuplicatedPortfolio,
  buildNewPortfolio,
  extractAllValidAssetIds,
  normalizeImportedPortfolio,
} from "@/components/portfolio/portfolio.helpers";
import type {
  CanvasElement,
  FrameElement,
  ImageElement,
  MoodboardItem,
  Portfolio,
} from "@/components/portfolio/sketch/types";
import {
  createInitialPortfolio,
  DEFAULT_THEMES,
} from "@/components/portfolio/sketch/utils/defaultPortfolios";
import { getAssetImage, saveAssetImage } from "@/lib/storage/imageStorageDb";

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

const image = (id: string, src: string): ImageElement =>
  ({
    id,
    type: "image",
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    zIndex: 1,
    src,
  }) as ImageElement;

const frame = (id: string, inspirationImageUrl: string): FrameElement =>
  ({
    id,
    type: "frame",
    title: id,
    preset: "desktop",
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    zIndex: 1,
    inspirationImageUrl,
  }) as FrameElement;

const mood = (id: string, url = ""): MoodboardItem => ({
  id,
  url,
  name: "Mood",
  dominantColors: ["#000"],
  tags: [],
});

const portfolio = (
  elements: CanvasElement[] = [],
  moodboard: MoodboardItem[] = []
): Portfolio => ({
  id: "p1",
  title: "P1",
  description: "",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  elements,
  moodboard,
  theme: { ...DEFAULT_THEMES[0] },
  generatedDesigns: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe("buildNewPortfolio", () => {
  it("builds a blank portfolio with defaults", () => {
    const created = buildNewPortfolio();

    expect(created.title).toBe("Untitled Portfolio");
    expect(created.elements).toEqual([]);
    expect(created.moodboard).toEqual([]);
    expect(created.theme).toEqual(DEFAULT_THEMES[0]);
    expect(created.id).toBeTruthy();
  });

  it("honours explicit title and description", () => {
    const created = buildNewPortfolio({
      title: "Mine",
      description: "desc",
    });

    expect(created.title).toBe("Mine");
    expect(created.description).toBe("desc");
  });

  it("seeds template elements and theme when requested", () => {
    const base = createInitialPortfolio();
    const created = buildNewPortfolio({
      profile: { name: "Ada", title: "Engineer" },
      template: true,
    });

    expect(created.elements.length).toBeGreaterThan(0);
    expect(created.theme.id).toBe(base.theme.id);
  });
});

describe("buildDuplicatedPortfolio", () => {
  it("clones the record with a new id and remapped element/moodboard ids", async () => {
    const clone = await buildDuplicatedPortfolio(
      portfolio([rect("e1")], [mood("m1")])
    );

    expect(clone.id).not.toBe("p1");
    expect(clone.title).toBe("P1 (Copy)");
    expect(clone.elements[0]?.id).not.toBe("e1");
    expect(clone.moodboard[0]?.id).not.toBe("m1");
  });

  it("clones IndexedDB assets so copies are independent", async () => {
    await saveAssetImage("asset-a", "data:,a");
    await saveAssetImage("asset-b", "data:,b");
    await saveAssetImage("asset-c", "data:,c");
    const clone = await buildDuplicatedPortfolio(
      portfolio(
        [image("img", "idb://asset-a"), frame("f", "idb://asset-b")],
        [mood("m", "idb://asset-c")]
      )
    );

    const clonedImage = clone.elements[0] as ImageElement;
    const clonedFrame = clone.elements[1] as FrameElement;
    const [clonedMood] = clone.moodboard;

    expect(clonedImage.src.startsWith("idb://")).toBe(true);
    expect(clonedImage.src).not.toBe("idb://asset-a");
    expect(await getAssetImage(clonedImage.src.replace("idb://", ""))).toBe(
      "data:,a"
    );
    expect(clonedFrame.inspirationImageUrl).not.toBe("idb://asset-b");
    expect(
      await getAssetImage(
        (clonedFrame.inspirationImageUrl ?? "").replace("idb://", "")
      )
    ).toBe("data:,b");
    expect(clonedMood?.url).not.toBe("idb://asset-c");
    expect(await getAssetImage(clonedMood?.id ?? "")).toBe("data:,c");
  });

  it("keeps the original reference when an asset is missing", async () => {
    const clone = await buildDuplicatedPortfolio(
      portfolio([image("img", "idb://missing")])
    );

    expect((clone.elements[0] as ImageElement).src).toBe("idb://missing");
  });

  it("keeps a frame's inspiration and moodboard references when assets are missing", async () => {
    const clone = await buildDuplicatedPortfolio(
      portfolio(
        [frame("f", "idb://missing-frame")],
        [mood("m", "idb://missing-mood")]
      )
    );

    expect((clone.elements[0] as FrameElement).inspirationImageUrl).toBe(
      "idb://missing-frame"
    );
    expect(clone.moodboard[0]?.url).toBe("idb://missing-mood");
  });

  it("tolerates a portfolio with no moodboard array", async () => {
    const source = { ...portfolio([rect("e1")]) } as Portfolio;
    (source as { moodboard?: unknown }).moodboard = undefined;

    const clone = await buildDuplicatedPortfolio(source);

    expect(clone.moodboard).toEqual([]);
  });
});

describe("normalizeImportedPortfolio", () => {
  it("rejects non-object input", () => {
    expect(normalizeImportedPortfolio(null, DEFAULT_THEMES[0])).toBeNull();
    expect(normalizeImportedPortfolio(5, DEFAULT_THEMES[0])).toBeNull();
  });

  it("coerces non-string title, description and createdAt to safe values", () => {
    const result = normalizeImportedPortfolio(
      {
        createdAt: { bad: true },
        description: { bad: true },
        title: { bad: true },
      },
      DEFAULT_THEMES[0]
    );

    expect(result?.title).toBe("Imported Portfolio");
    expect(result?.description).toBe("");
    expect(typeof result?.createdAt).toBe("string");

    const collided = normalizeImportedPortfolio(
      { title: { bad: true } },
      DEFAULT_THEMES[0],
      true
    );
    expect(collided?.title).toBe("Portfolio (Imported)");
  });

  it("keeps valid elements and drops malformed ones", () => {
    const result = normalizeImportedPortfolio(
      {
        elements: [
          rect("ok"),
          { id: "bad-type", type: "nope", x: 0, y: 0 },
          { id: "bad-pos", type: "rectangle", x: "no", y: 0 },
          { type: "rectangle", x: 0, y: 0 },
        ],
      },
      DEFAULT_THEMES[0]
    );

    expect(result?.elements?.map((el) => el.id)).toEqual(["ok"]);
  });

  it("drops image and frame elements whose asset URL is not a string", () => {
    const result = normalizeImportedPortfolio(
      {
        elements: [
          rect("ok"),
          { id: "img-bad", type: "image", x: 0, y: 0, src: 123 },
          {
            id: "frame-bad",
            type: "frame",
            x: 0,
            y: 0,
            inspirationImageUrl: 7,
          },
          { id: "img-ok", type: "image", x: 0, y: 0, src: "idb://asset" },
        ],
      },
      DEFAULT_THEMES[0]
    );

    expect(result?.elements?.map((el) => el.id)).toEqual(["ok", "img-ok"]);
  });

  it("normalizes moodboard defaults", () => {
    const result = normalizeImportedPortfolio(
      { moodboard: [{}] },
      DEFAULT_THEMES[0]
    );

    const [item] = result?.moodboard ?? [];
    expect(item?.id).toBeTruthy();
    expect(item?.url).toBe("");
    expect(item?.name).toBe("Moodboard Item");
    expect(item?.dominantColors).toEqual(["#6366f1", "#06b6d4"]);
    expect(item?.tags).toEqual([]);
  });

  it("keeps moodboard fields when they are provided", () => {
    const result = normalizeImportedPortfolio(
      {
        moodboard: [
          {
            dominantColors: ["#111111"],
            id: "m1",
            name: "N",
            notes: "note",
            tags: ["a"],
            url: "http://x",
          },
        ],
      },
      DEFAULT_THEMES[0]
    );

    const [item] = result?.moodboard ?? [];
    expect(item).toMatchObject({
      dominantColors: ["#111111"],
      id: "m1",
      name: "N",
      notes: "note",
      tags: ["a"],
      url: "http://x",
    });
  });

  it("only carries safe string theme keys over the base", () => {
    const result = normalizeImportedPortfolio(
      {
        theme: {
          primaryColor: "#123456",
          borderRadius: 42,
          injected: "x",
        },
      },
      DEFAULT_THEMES[0]
    );

    expect(result?.theme.primaryColor).toBe("#123456");
    expect(result?.theme.borderRadius).toBe(DEFAULT_THEMES[0].borderRadius);
    expect("injected" in (result?.theme ?? {})).toBe(false);
  });

  it("keeps a valid viewport and defaults an invalid one", () => {
    const valid = normalizeImportedPortfolio(
      { viewport: { x: 1, y: 2, zoom: 3 } },
      DEFAULT_THEMES[0]
    );
    expect(valid?.viewport).toEqual({ x: 1, y: 2, zoom: 3 });

    const invalid = normalizeImportedPortfolio(
      { viewport: { x: 1, y: 2 } },
      DEFAULT_THEMES[0]
    );
    expect(invalid?.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it("always assigns a fresh id, even when the incoming one is new", () => {
    const first = normalizeImportedPortfolio({ id: "keep" }, DEFAULT_THEMES[0]);
    expect(first?.id).toBeTruthy();
    expect(first?.id).not.toBe("keep");

    const second = normalizeImportedPortfolio(
      { id: "keep" },
      DEFAULT_THEMES[0]
    );
    expect(second?.id).not.toBe(first?.id);

    const generated = normalizeImportedPortfolio(
      { title: "No id" },
      DEFAULT_THEMES[0]
    );
    expect(generated?.id).toBeTruthy();

    const collided = normalizeImportedPortfolio(
      { id: "keep", title: "Dup" },
      DEFAULT_THEMES[0],
      true
    );
    expect(collided?.id).not.toBe("keep");
    expect(collided?.title).toBe("Dup (Imported)");
  });
});

describe("extractAllValidAssetIds", () => {
  it("collects ids from elements, moodboard, clipboard and history", () => {
    const ids = extractAllValidAssetIds(
      [
        portfolio(
          [image("i", "idb://a"), frame("f", "idb://b")],
          [mood("c", "idb://d")]
        ),
      ],
      [image("clip", "idb://e")],
      {
        past: [{ elements: [image("h", "idb://f")], moodboard: [mood("g")] }],
        future: [{ elements: [image("h2", "idb://h")] }],
      }
    );

    expect(ids).toEqual(new Set(["a", "b", "c", "d", "e", "f", "g", "h"]));
  });
});
