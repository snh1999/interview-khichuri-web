import { describe, expect, it } from "vitest";
import type {
  CanvasElement,
  FrameElement,
  PenElement,
} from "@/components/portfolio/sketch/types";
import {
  getContainingFrame,
  getEffectiveElementStateMap,
  getElementsWithContainedChildren,
  isElementContainedInFrame,
} from "@/components/portfolio/sketch/utils/containment";

const frame = (overrides: Partial<FrameElement> = {}) =>
  ({
    id: "f1",
    type: "frame",
    title: "f1",
    preset: "desktop",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    zIndex: 1,
    ...overrides,
  }) as FrameElement;

const el = (overrides: Partial<CanvasElement> = {}) =>
  ({
    id: "e1",
    type: "rectangle",
    x: 10,
    y: 10,
    width: 10,
    height: 10,
    zIndex: 1,
    ...overrides,
  }) as CanvasElement;

describe("isElementContainedInFrame", () => {
  it("returns false for a missing element/frame or the frame itself", () => {
    expect(isElementContainedInFrame(el(), frame())).toBe(true);
    expect(isElementContainedInFrame(el(), frame({ id: "e1" }))).toBe(false);
    expect(isElementContainedInFrame(null as never, frame())).toBe(false);
    expect(isElementContainedInFrame(el(), null as never)).toBe(false);
  });

  it("honours an explicit frameId", () => {
    expect(
      isElementContainedInFrame(el({ frameId: "f1", x: 9000 }), frame())
    ).toBe(true);
    expect(isElementContainedInFrame(el({ frameId: "other" }), frame())).toBe(
      true
    ); // still geometrically inside
  });

  it("uses bounding boxes for lines and arrows", () => {
    expect(
      isElementContainedInFrame(
        el({ type: "line", x: 10, y: 10, endX: 20, endY: 20 }),
        frame()
      )
    ).toBe(true);
    expect(
      isElementContainedInFrame(
        el({ type: "arrow", x: 10, y: 10, endX: 200, endY: 200 }),
        frame()
      )
    ).toBe(false);
  });

  it("uses the point cloud bounds for pen strokes", () => {
    const pen = el({
      type: "pen",
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
    }) as PenElement;
    expect(isElementContainedInFrame(pen, frame())).toBe(true);

    const scattered = el({
      type: "pen",
      points: [
        { x: 10, y: 10 },
        { x: 500, y: 10 },
      ],
    }) as PenElement;
    expect(isElementContainedInFrame(scattered, frame())).toBe(false);

    const empty = el({ type: "pen", points: [] }) as PenElement;
    expect(isElementContainedInFrame(empty, frame())).toBe(true);
  });

  it("accepts a reasonably-sized child whose centre is inside", () => {
    expect(
      isElementContainedInFrame(
        el({ x: -40, y: -40, width: 100, height: 100 }),
        frame()
      )
    ).toBe(true);
  });

  it("rejects a child far larger than the frame even with an inside centre", () => {
    expect(
      isElementContainedInFrame(
        el({ x: -500, y: -500, width: 1200, height: 1200 }),
        frame()
      )
    ).toBe(false);
  });
});

describe("getContainingFrame", () => {
  it("returns null for frames and falls back to geometry for a dangling frameId", () => {
    expect(getContainingFrame(frame(), [frame()])).toBeNull();
    expect(getContainingFrame(null as never, [frame()])).toBeNull();

    const child = el({ frameId: "ghost", x: 5, y: 5 });
    expect(getContainingFrame(child, [frame(), child])?.id).toBe("f1");
  });
});

describe("getEffectiveElementStateMap", () => {
  it("maps every element to its effective lock/visibility", () => {
    const parent = frame({ locked: true, visible: false });
    const child = el({ frameId: "f1" });
    const map = getEffectiveElementStateMap([parent, child]);

    expect(map.get("f1")).toEqual({ locked: true, visible: false });
    expect(map.get("e1")).toEqual({ locked: true, visible: false });
  });
});

describe("getElementsWithContainedChildren", () => {
  it("returns empty for empty input or empty selection", () => {
    expect(getElementsWithContainedChildren([], ["e1"])).toEqual([]);
    expect(getElementsWithContainedChildren([el()], [])).toEqual([]);
    expect(
      getElementsWithContainedChildren(null as never, null as never)
    ).toEqual([]);
  });

  it("returns selected elements plus a selected frame's children in order", () => {
    const parent = frame();
    const child = el({ id: "c1", frameId: "f1" });
    const loose = el({ id: "loose", x: 500 });
    const result = getElementsWithContainedChildren(
      [parent, child, loose],
      ["f1"]
    );

    expect(result.map((e) => e.id)).toEqual(["f1", "c1"]);
  });
});
