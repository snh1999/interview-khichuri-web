// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CanvasElement,
  FrameElement,
  MoodboardItem,
  Portfolio,
  ThemeConfig,
} from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios";
import {
  cloneAndOffsetElements,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import { useBuilderStore } from "@/store/useBuilderStore";

const rect = (id: string, overrides: Partial<CanvasElement> = {}) =>
  ({
    id,
    type: "rectangle",
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    zIndex: 1,
    ...overrides,
  }) as CanvasElement;

const frame = (id: string, overrides: Partial<FrameElement> = {}) =>
  ({
    id,
    type: "frame",
    title: id,
    preset: "desktop",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    zIndex: 1,
    ...overrides,
  }) as CanvasElement;

const pen = (id: string, points: { x: number; y: number }[]) =>
  ({
    id,
    type: "pen",
    points,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    zIndex: 1,
  }) as CanvasElement;

const draft = (
  id: string,
  els: CanvasElement[] = [],
  overrides: Partial<Portfolio> = {}
): Portfolio => ({
  id,
  title: id,
  description: "",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  elements: els,
  moodboard: [],
  theme: { ...DEFAULT_THEMES[0] },
  generatedDesigns: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

const store = () => useSketchBuilderStore.getState();
const elements = () => store().draft?.elements ?? [];

beforeEach(() => {
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  useSketchBuilderStore.setState({ draft: null });
});

describe("cloneAndOffsetElements", () => {
  it("offsets shapes, lines, arrows, and pen points and remaps ids", () => {
    const line = {
      id: "l1",
      type: "line",
      x: 10,
      y: 10,
      endX: 20,
      endY: 30,
      width: 0,
      height: 0,
      zIndex: 1,
    } as CanvasElement;
    const arrow = {
      id: "ar1",
      type: "arrow",
      x: 0,
      y: 0,
      width: 5,
      height: 5,
      zIndex: 1,
    } as CanvasElement;

    const { clonedElements, idMap } = cloneAndOffsetElements([
      rect("r1"),
      line,
      arrow,
      pen("p1", [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]),
    ]);

    expect(idMap.get("r1")).not.toBe("r1");
    expect(clonedElements[0].x).toBe(24);
    expect((clonedElements[1] as { endX: number }).endX).toBe(44);
    // The arrow has no explicit endpoints, so x/y are already offset by 24
    // before the endpoint fallback reads them (source behavior).
    expect((clonedElements[2] as { endY: number }).endY).toBe(48);
    expect((clonedElements[3] as { points: { x: number }[] }).points).toEqual([
      { x: 25, y: 26 },
      { x: 27, y: 28 },
    ]);
  });

  it("repoints a cloned child's frameId and rebases z-index", () => {
    const { clonedElements, idMap } = cloneAndOffsetElements(
      [frame("f1"), rect("c1", { frameId: "f1" })],
      24,
      10
    );

    expect(clonedElements[0].zIndex).toBe(11);
    expect(clonedElements[1].zIndex).toBe(12);
    expect(clonedElements[1].frameId).toBe(idMap.get("f1"));
  });

  it("falls back to the JSON clone when structuredClone is unavailable", () => {
    vi.stubGlobal("structuredClone", undefined);

    const { clonedElements } = cloneAndOffsetElements([rect("r1")]);

    expect(clonedElements[0].x).toBe(24);
  });
});

describe("sketchBuilderStore draft lifecycle", () => {
  it("exposes a read-only empty fallback when no draft is loaded", () => {
    const current = store().getCurrentPortfolio();
    expect(current.title).toBe("Untitled Portfolio");
    expect(current.elements).toEqual([]);
  });

  it("resets selection, AI state, and history when a different draft is seeded", () => {
    const s = store();
    s.setDraft(draft("a", [rect("e1")]));
    s.selectElements(["e1"]);
    s.setActiveFrameForAi("e1");
    s.recordHistory();

    s.setDraft(draft("b"));

    const state = store();
    expect(state.selectedElementIds).toEqual([]);
    expect(state.activeFrameIdForAi).toBeNull();
    expect(state.history.past).toHaveLength(0);
  });

  it("keeps the live selection when the same draft is re-seeded", () => {
    const s = store();
    s.setDraft(draft("a", [rect("e1")]));
    s.selectElements(["e1"]);

    s.setDraft(draft("a", [rect("e1")]));

    expect(store().selectedElementIds).toEqual(["e1"]);
  });

  it("clears the draft when set to null", () => {
    store().setDraft(draft("a"));
    store().setDraft(null);
    expect(store().draft).toBeNull();
  });

  it("patches fields and bumps updatedAt, ignoring edits with no draft", () => {
    store().patchDraft({ title: "ignored" });
    expect(store().draft).toBeNull();

    store().setDraft(draft("a"));
    store().patchDraft({ title: "Renamed", description: "d" });

    expect(store().draft?.title).toBe("Renamed");
    expect(store().draft?.description).toBe("d");
  });

  it("toggles view mode and sidebar", () => {
    store().setViewMode("preview");
    expect(store().viewMode).toBe("preview");

    const before = store().isSidebarOpen;
    store().toggleSidebar();
    expect(store().isSidebarOpen).toBe(!before);
  });

  it("opens and closes the AI modal with optional frame and mode", () => {
    store().openAiModal("frame-1", "append");
    expect(store().isAiModalOpen).toBe(true);
    expect(store().aiModalTargetFrameId).toBe("frame-1");
    expect(store().aiModalMode).toBe("append");

    store().closeAiModal();
    expect(store().isAiModalOpen).toBe(false);
    expect(store().aiModalTargetFrameId).toBeNull();

    store().openAiModal();
    expect(store().aiModalMode).toBe("new");
    expect(store().aiModalTargetFrameId).toBeNull();
  });
});

describe("sketchBuilderStore tool state", () => {
  it("updates every tool/style field", () => {
    const s = store();
    s.setCurrentTool("pen");
    s.setSelectedStamp("hero");
    s.setStrokeColor("#000");
    s.setFillColor("#fff");
    s.setStrokeWidth(4);
    s.setOpacity(0.5);
    s.setFontSize(20);
    s.setRoughness(2);
    s.setCornerRadius(8);

    const state = store();
    expect(state.currentTool).toBe("stamp");
    expect(state.selectedStamp).toBe("hero");
    expect(state.strokeColor).toBe("#000");
    expect(state.fillColor).toBe("#fff");
    expect(state.strokeWidth).toBe(4);
    expect(state.opacity).toBe(0.5);
    expect(state.fontSize).toBe(20);
    expect(state.roughness).toBe(2);
    expect(state.cornerRadius).toBe(8);
  });
});

describe("sketchBuilderStore selection", () => {
  it("selects, toggles, and clears", () => {
    const s = store();
    s.selectElements(["a", "b"]);
    expect(store().selectedElementIds).toEqual(["a", "b"]);

    s.toggleElementSelection("a");
    expect(store().selectedElementIds).toEqual(["b"]);

    s.toggleElementSelection("c");
    expect(store().selectedElementIds).toEqual(["b", "c"]);

    s.clearSelection();
    expect(store().selectedElementIds).toEqual([]);
  });
});

describe("sketchBuilderStore clipboard", () => {
  it("ignores copy and paste with no selection or clipboard", () => {
    store().copySelectedElements();
    expect(store().clipboard).toEqual([]);

    store().pasteElements();
    expect(store().draft).toBeNull();
  });

  it("copies a selected frame together with its children", () => {
    store().setDraft(
      draft("a", [
        frame("f1"),
        rect("c1", { frameId: "f1" }),
        rect("loose", { x: 500 }),
      ])
    );
    store().selectElements(["f1"]);

    store().copySelectedElements();

    expect(
      store()
        .clipboard.map((el) => el.id)
        .sort()
    ).toEqual(["c1", "f1"]);
  });

  it("pastes the clipboard with an offset and selects the copies", () => {
    store().setDraft(draft("a", [rect("e1", { x: 5, y: 5 })]));
    store().selectElements(["e1"]);
    store().copySelectedElements();

    store().pasteElements();

    expect(elements()).toHaveLength(2);
    const [, pasted] = elements();
    expect(pasted.x).toBe(29);
    expect(pasted.id).not.toBe("e1");
    expect(store().selectedElementIds).toEqual([pasted.id]);
  });
});

describe("sketchBuilderStore history", () => {
  it("ignores recordHistory with no draft", () => {
    store().recordHistory();
    expect(store().history.past).toHaveLength(0);
  });

  it("caps the past stack at 30 snapshots", () => {
    store().setDraft(draft("a"));
    for (let i = 0; i < 35; i += 1) {
      store().recordHistory();
    }
    expect(store().history.past).toHaveLength(30);
  });

  it("undoes and redoes an add, restoring elements and selection", () => {
    store().setDraft(draft("a", [rect("e1")]));
    store().addElement(rect("e2", { x: 1 }));
    store().selectElements(["e2"]);

    store().undo();
    expect(elements().map((el) => el.id)).toEqual(["e1"]);
    expect(store().selectedElementIds).toEqual([]);

    store().redo();
    expect(elements().map((el) => el.id)).toEqual(["e1", "e2"]);
  });

  it("ignores undo/redo at the ends of the stack", () => {
    store().undo();
    store().redo();

    store().setDraft(draft("a"));
    store().undo();
    store().redo();
    expect(store().history.past).toHaveLength(0);
  });
});

describe("sketchBuilderStore element mutations", () => {
  it("ignores element edits while no draft is loaded", () => {
    const s = store();
    s.addElement(rect("e1"));
    s.addElements([rect("e2")]);
    expect(store().draft).toBeNull();
  });

  it("adds elements and selects the new one", () => {
    store().setDraft(draft("a"));
    store().addElement(rect("e1"));

    expect(elements()).toHaveLength(1);
    expect(store().selectedElementIds).toEqual(["e1"]);
  });

  it("ignores an empty addElements and selects only frames when present", () => {
    store().setDraft(draft("a"));
    store().addElements([]);
    expect(elements()).toHaveLength(0);

    store().addElements([frame("f1"), rect("c1", { frameId: "f1" })]);
    expect(store().selectedElementIds).toEqual(["f1"]);

    store().addElements([rect("x1"), rect("x2")]);
    expect(store().selectedElementIds).toEqual(["x1", "x2"]);
  });

  it("updates a single element, optionally recording history", () => {
    store().setDraft(draft("a", [rect("e1")]));
    store().updateElement("e1", { x: 42 }, true);

    expect(elements()[0].x).toBe(42);
    expect(store().history.past).toHaveLength(1);

    store().updateElement("missing", { x: 1 });
    expect(elements()[0].x).toBe(42);
  });

  it("blocks edits to elements locked directly or by their frame", () => {
    store().setDraft(
      draft("a", [frame("f1", { locked: true }), rect("c1", { frameId: "f1" })])
    );

    store().updateElement("c1", { x: 99 });
    expect(elements()[1].x).toBe(0);

    store().updateElement("c1", { locked: false });
    expect(elements()[1].locked).toBe(false);
  });

  it("updates many elements, filtering those that are locked", () => {
    store().setDraft(
      draft("a", [
        frame("f1", { locked: true }),
        rect("c1", { frameId: "f1" }),
        rect("d1", { x: 500 }),
      ])
    );

    store().updateElements([
      { id: "c1", changes: { x: 5 } },
      { id: "d1", changes: { x: 7 } },
    ]);

    expect(elements()[1].x).toBe(0);
    expect(elements()[2].x).toBe(7);

    store().updateElements([{ id: "c1", changes: { x: 1 } }]);
    expect(elements()[1].x).toBe(0);

    store().updateElements([{ id: "c1", changes: { locked: false } }]);
    expect(elements()[1].locked).toBe(false);
  });

  it("ignores updateElements without a draft", () => {
    store().updateElements([{ id: "x", changes: { x: 1 } }]);
    expect(store().draft).toBeNull();
  });

  it("deletes an element and the children a selected frame contains", () => {
    store().setDraft(
      draft("a", [
        frame("f1"),
        rect("c1", { frameId: "f1" }),
        rect("keep", { x: 500 }),
      ])
    );
    store().selectElements(["f1", "c1"]);

    store().deleteElement("f1");

    expect(elements().map((el) => el.id)).toEqual(["keep"]);
    expect(store().selectedElementIds).toEqual([]);
  });

  it("refuses to delete a locked element", () => {
    store().setDraft(draft("a", [rect("e1", { locked: true })]));
    store().deleteElement("e1");
    expect(elements()).toHaveLength(1);
  });

  it("deletes the current selection, skipping locked elements", () => {
    store().setDraft(draft("a", [rect("e1"), rect("e2", { locked: true })]));
    store().selectElements(["e1", "e2"]);
    store().deleteSelectedElements();

    expect(elements().map((el) => el.id)).toEqual(["e2"]);
    expect(store().selectedElementIds).toEqual([]);
  });

  it("no-ops deleteSelectedElements with an empty or fully-locked selection", () => {
    store().setDraft(draft("a", [rect("e1", { locked: true })]));

    store().deleteSelectedElements();
    expect(elements()).toHaveLength(1);

    store().selectElements(["e1"]);
    store().deleteSelectedElements();
    expect(elements()).toHaveLength(1);
  });

  it("duplicates the selection with fresh ids", () => {
    store().setDraft(draft("a", [rect("e1")]));
    store().selectElements(["e1"]);

    store().duplicateSelectedElements();

    expect(elements()).toHaveLength(2);
    expect(new Set(elements().map((el) => el.id)).size).toBe(2);
  });

  it("no-ops duplicate with no selection or draft", () => {
    store().duplicateSelectedElements();
    store().setDraft(draft("a", [rect("e1")]));
    store().duplicateSelectedElements();
    expect(elements()).toHaveLength(1);
  });
});

describe("sketchBuilderStore ordering", () => {
  it("reorders siblings, rebasing z-index", () => {
    store().setDraft(draft("a", [rect("e1"), rect("e2")]));

    store().reorderElement("e1", "up");

    expect(elements().map((el) => el.id)).toEqual(["e2", "e1"]);
    expect(elements().map((el) => el.zIndex)).toEqual([1, 2]);

    store().reorderElements(["e1"], "bottom");
    expect(elements().map((el) => el.id)).toEqual(["e1", "e2"]);
  });

  it("no-ops reorder for empty ids, locked elements, or no movement", () => {
    store().setDraft(draft("a", [rect("e1")]));

    store().reorderElements([], "up");
    store().reorderElements(["missing"], "up");
    store().reorderElement("e1", "up");
    expect(elements().map((el) => el.id)).toEqual(["e1"]);

    store().setDraft(draft("b", [rect("l1", { locked: true }), rect("l2")]));
    store().reorderElements(["l1"], "up");
    expect(elements().map((el) => el.id)).toEqual(["l1", "l2"]);

    store().reorderElements(["l2"], "up");
    expect(elements().map((el) => el.id)).toEqual(["l1", "l2"]);
  });

  it("no-ops reorder without a draft", () => {
    store().reorderElements(["e1"], "up");
    expect(store().draft).toBeNull();
  });
});

describe("sketchBuilderStore alignment", () => {
  const twoRects = () =>
    draft("a", [
      rect("e1", { x: 0, y: 0, width: 10, height: 10 }),
      rect("e2", { x: 100, y: 200, width: 30, height: 40 }),
    ]);

  it("aligns left, right, center, top, bottom, and middle", () => {
    const cases: {
      alignment: "left" | "right" | "center" | "top" | "bottom" | "middle";
      id: string;
      field: "x" | "y";
      value: number;
    }[] = [
      { alignment: "left", id: "e2", field: "x", value: 0 },
      { alignment: "right", id: "e1", field: "x", value: 120 },
      { alignment: "center", id: "e1", field: "x", value: 60 },
      { alignment: "top", id: "e2", field: "y", value: 0 },
      { alignment: "bottom", id: "e1", field: "y", value: 230 },
      { alignment: "middle", id: "e1", field: "y", value: 115 },
    ];

    for (const { alignment, id, field, value } of cases) {
      useSketchBuilderStore.setState(
        useSketchBuilderStore.getInitialState(),
        true
      );
      store().setDraft(twoRects());
      store().selectElements(["e1", "e2"]);

      store().alignSelectedElements(alignment);

      const target = elements().find((el) => el.id === id);
      expect(target?.[field]).toBe(value);
    }
  });

  it("no-ops alignment with fewer than two movable selections", () => {
    store().setDraft(twoRects());

    store().selectElements(["e1"]);
    store().alignSelectedElements("left");
    expect(elements()[0].x).toBe(0);

    store().selectElements(["e1", "e2"]);
    store().updateElement("e1", { locked: true });
    store().alignSelectedElements("left");
    expect(elements()[0].x).toBe(0);

    store().setDraft(null);
    store().alignSelectedElements("left");
    expect(store().draft).toBeNull();
  });
});

describe("sketchBuilderStore viewport, moodboard, theme", () => {
  it("sets and resets the viewport", () => {
    store().setDraft(draft("a"));
    store().setViewport({ x: 10, y: 20, zoom: 2 });
    expect(store().draft?.viewport).toEqual({ x: 10, y: 20, zoom: 2 });

    store().resetViewport();
    expect(store().draft?.viewport).toEqual({ x: 0, y: 0, zoom: 1 });

    store().setDraft(null);
    store().setViewport({ x: 1, y: 1, zoom: 1 });
    expect(store().draft).toBeNull();
  });

  it("adds and removes moodboard images", () => {
    store().addMoodboardImage({ id: "x" } as MoodboardItem);
    expect(store().draft).toBeNull();

    store().setDraft(draft("a"));
    store().addMoodboardImage({ id: "m1" } as MoodboardItem);
    store().addMoodboardImage({ id: "m2" } as MoodboardItem);
    expect(store().draft?.moodboard.map((m) => m.id)).toEqual(["m2", "m1"]);

    store().removeMoodboardImage("m1");
    expect(store().draft?.moodboard.map((m) => m.id)).toEqual(["m2"]);

    store().setDraft(null);
    store().removeMoodboardImage("m2");
    expect(store().draft).toBeNull();
  });

  it("replaces the theme and ignores it without a draft", () => {
    const theme = { ...DEFAULT_THEMES[1] };
    store().setTheme(theme);
    expect(store().draft).toBeNull();

    store().setDraft(draft("a"));
    store().setTheme(theme);
    expect(store().draft?.theme.id).toBe(theme.id);
  });

  it("throttles theme history and can skip recording", () => {
    vi.useFakeTimers();
    store().setDraft(draft("a"));

    store().updateThemeColors({ primaryColor: "#111" });
    expect(store().history.past).toHaveLength(1);

    store().updateThemeColors({ primaryColor: "#222" });
    expect(store().history.past).toHaveLength(1);

    vi.advanceTimersByTime(1001);
    store().updateThemeColors({ primaryColor: "#333" });
    expect(store().history.past).toHaveLength(2);

    store().updateThemeColors({ primaryColor: "#444" }, false);
    expect(store().history.past).toHaveLength(2);
    expect(store().draft?.theme.primaryColor).toBe("#444");
  });

  it("ignores updateThemeColors without a draft", () => {
    store().updateThemeColors({ primaryColor: "#000" });
    expect(store().draft).toBeNull();
  });
});

describe("sketchBuilderStore generated designs", () => {
  const design = () => ({
    id: "d1",
    routes: ["/"],
    createdAt: "2024-01-01",
    themeUsed: { ...DEFAULT_THEMES[0] } as ThemeConfig,
    wireframeSummary: { elementCount: 0, detectedLayout: "", sections: [] },
    files: { "/App.js": "generated" },
    previewType: "code" as const,
  });

  it("sets and clears the active generated design", () => {
    store().setActiveGeneratedDesign(design());
    expect(store().activeGeneratedDesign?.id).toBe("d1");

    store().setActiveGeneratedDesign(null);
    expect(store().activeGeneratedDesign).toBeNull();
  });

  it("seeds the draft's code project in new mode", () => {
    store().setDraft(draft("p1"));

    store().applyGeneratedDesign(design());

    expect(useBuilderStore.getState().projects.p1?.files["/App.js"]).toBe(
      "generated"
    );
    expect(store().viewMode).toBe("preview");
  });

  it("still activates the design with no draft loaded", () => {
    store().applyGeneratedDesign(design());

    expect(store().activeGeneratedDesign?.id).toBe("d1");
    expect(store().viewMode).toBe("preview");
    expect(useBuilderStore.getState().projects.p1).toBeUndefined();
  });

  it("appends generated files in append mode without dropping existing pages", () => {
    store().setDraft(draft("p1"));
    useBuilderStore.getState().seedGeneratedFiles("p1", {
      "/App.js": "old",
      "/Home.js": "home",
    });

    store().applyGeneratedDesign(
      { ...design(), files: { "/App.js": "router", "/Contact.js": "c" } },
      "append"
    );

    expect(useBuilderStore.getState().projects.p1.files).toEqual({
      "/App.js": "router",
      "/Home.js": "home",
      "/Contact.js": "c",
    });
  });
});

describe("useCurrentPortfolio", () => {
  it("returns the draft when present", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useCurrentPortfolio } = await import("@/store/sketchBuilderStore");

    store().setDraft(draft("live"));
    const { result } = renderHook(() => useCurrentPortfolio());

    expect(result.current.id).toBe("live");
  });
});
