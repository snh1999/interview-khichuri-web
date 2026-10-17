import { describe, expect, it } from "vitest";
import type {
  CanvasElement,
  FrameElement,
} from "@/components/portfolio/sketch/types";
import {
  getContainingFrame,
  getEffectiveElementState,
  getLockedElementIds,
} from "@/components/portfolio/sketch/utils/containment";
import { reorderWithinGroups } from "@/components/portfolio/sketch/utils/reorder";

const frame = (id: string, overrides: Partial<FrameElement> = {}) =>
  ({
    id,
    type: "frame",
    name: id,
    title: id,
    preset: "desktop",
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
    zIndex: 1,
    ...overrides,
  }) as FrameElement;

const el = (id: string, overrides: Partial<CanvasElement> = {}) =>
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

const layerScenario = () => {
  const frameA = frame("frame-a");
  const childA1 = el("a1", { frameId: "frame-a" });
  const childA2 = el("a2", { frameId: "frame-a" });
  const frameB = frame("frame-b", { x: 2000 });
  const childB = el("b1", { frameId: "frame-b", x: 2000 });
  return [frameA, childA1, childA2, frameB, childB];
};

const ids = (elements: CanvasElement[]) => elements.map((e) => e.id);

describe("reorderWithinGroups", () => {
  it("reorders inside a frame without crossing into another frame", () => {
    const elements = layerScenario();
    const reordered = reorderWithinGroups(elements, ["a1"], "up");
    expect(reordered).not.toBeNull();
    // a1 swaps with its sibling a2; the frame and the other artboard stay put.
    expect(ids(reordered as CanvasElement[])).toEqual([
      "frame-a",
      "a2",
      "a1",
      "frame-b",
      "b1",
    ]);
  });

  it("treats the front-most sibling as already forward (no-op)", () => {
    const elements = layerScenario();
    // a2 is the last child of frame-a, so "up" has nowhere to go.
    expect(reorderWithinGroups(elements, ["a2"], "up")).toBeNull();
  });

  it("sends a child to the back of its own frame, never behind the frame", () => {
    const elements = layerScenario();
    const reordered = reorderWithinGroups(elements, ["a2"], "bottom");
    expect(ids(reordered as CanvasElement[])).toEqual([
      "frame-a",
      "a2",
      "a1",
      "frame-b",
      "b1",
    ]);
    // frame-a still precedes its children.
    expect((reordered as CanvasElement[])[0].id).toBe("frame-a");
  });
});

describe("effective lock & visibility inheritance", () => {
  it("inherits lock and visibility from the owning frame", () => {
    const elements = [
      frame("frame-a", { locked: true, visible: false }),
      el("a1", { frameId: "frame-a" }),
    ];
    expect(getContainingFrame(elements[1], elements)?.id).toBe("frame-a");
    expect(getEffectiveElementState(elements[1], elements)).toEqual({
      locked: true,
      visible: false,
    });
    expect(getLockedElementIds(elements).has("a1")).toBe(true);
  });

  it("infers ownership geometrically when frameId is absent", () => {
    const elements = [
      frame("frame-a", { locked: true }),
      el("inside", { x: 10, y: 10 }),
      el("outside", { x: 5000, y: 5000 }),
    ];
    const locked = getLockedElementIds(elements);
    expect(locked.has("inside")).toBe(true);
    expect(locked.has("outside")).toBe(false);
  });

  it("lets a child opt out of visibility on its own", () => {
    const elements = [
      frame("frame-a"),
      el("a1", { frameId: "frame-a", visible: false }),
    ];
    expect(getEffectiveElementState(elements[1], elements).visible).toBe(false);
  });
});
