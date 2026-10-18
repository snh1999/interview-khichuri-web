// @vitest-environment jsdom
import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Canvas } from "@/components/portfolio/sketch/Canvas.tsx";
import type {
  CanvasElement,
  FrameElement,
  Portfolio,
  StampType,
  ToolType,
} from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios.ts";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore.ts";
import { useBuilderStore } from "@/store/useBuilderStore.ts";
import { render } from "@/test/render.tsx";

const PAGE_SETUP = /page setup/i;

const store = () => useSketchBuilderStore.getState();
const elements = () => store().draft?.elements ?? [];

const portfolio = (
  els: CanvasElement[],
  viewport = { x: 0, y: 0, zoom: 1 }
): Portfolio => ({
  id: "p-canvas",
  title: "Canvas",
  description: "",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  elements: els,
  moodboard: [],
  theme: { ...DEFAULT_THEMES[0] },
  generatedDesigns: [],
  viewport,
});

const seed = (
  els: CanvasElement[],
  viewport?: { x: number; y: number; zoom: number }
) => useSketchBuilderStore.setState({ draft: portfolio(els, viewport) });

const rect = (
  id: string,
  overrides: Partial<CanvasElement> = {}
): CanvasElement =>
  ({
    id,
    type: "rectangle",
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    zIndex: 1,
    ...overrides,
  }) as CanvasElement;

const ellipse = (id: string, overrides: Partial<CanvasElement> = {}) =>
  rect(id, { type: "ellipse", ...overrides });

const arrow = (id: string, overrides: Partial<CanvasElement> = {}) =>
  rect(id, { type: "arrow", endX: 100, endY: 100, ...overrides });

const image = (id: string, overrides: Partial<CanvasElement> = {}) =>
  rect(id, { type: "image", src: "x.png", ...overrides });

const line = (
  id: string,
  overrides: Partial<CanvasElement> = {}
): CanvasElement =>
  ({
    id,
    type: "line",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    endX: 100,
    endY: 100,
    zIndex: 1,
    ...overrides,
  }) as CanvasElement;

const pen = (
  id: string,
  points = [
    { x: 0, y: 0 },
    { x: 20, y: 20 },
  ],
  overrides: Partial<CanvasElement> = {}
): CanvasElement =>
  ({
    id,
    type: "pen",
    points,
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    zIndex: 1,
    ...overrides,
  }) as CanvasElement;

const frame = (
  id: string,
  overrides: Partial<FrameElement> = {}
): FrameElement => ({
  id,
  type: "frame",
  title: id,
  route: `/${id}`,
  preset: "desktop",
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  zIndex: 1,
  ...overrides,
});

const text = (
  id: string,
  value = "Hello",
  overrides: Partial<CanvasElement> = {}
): CanvasElement =>
  ({
    id,
    type: "text",
    text: value,
    x: 0,
    y: 0,
    width: 180,
    height: 32,
    zIndex: 1,
    ...overrides,
  }) as CanvasElement;

const stamp = (
  id: string,
  overrides: Partial<CanvasElement> = {}
): CanvasElement =>
  ({
    id,
    type: "stamp",
    stampType: "hero",
    label: "Hero",
    sublabel: "Sub",
    x: 0,
    y: 0,
    width: 200,
    height: 80,
    zIndex: 1,
    ...overrides,
  }) as CanvasElement;

const setTool = (tool: ToolType) =>
  act(() => {
    store().setCurrentTool(tool);
  });

const selectIds = (ids: string[]) =>
  act(() => {
    store().selectElements(ids);
  });

const setStamp = (s: StampType) =>
  act(() => {
    store().setSelectedStamp(s);
  });

const container = () => {
  const svg = screen.getByRole("img", { name: "Design canvas" });
  return svg.parentElement as HTMLElement;
};

const element = (type: string) =>
  screen.getByRole("button", { name: `${type} element` });

// react-hotkeys-hook matches on event.code by default, so key events need a code.
const press = (key: string, code = key, opts: Record<string, unknown> = {}) =>
  fireEvent.keyDown(document.body, { key, code, ...opts });

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
});

afterEach(() => {
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
  vi.useRealTimers();
});

describe("Canvas rendering", () => {
  it("shows the empty state and adds a starter frame", async () => {
    seed([]);
    const { user } = render(<Canvas />);

    expect(screen.getByText("Canvas is Empty")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Add Desktop Artboard" })
    );

    expect(elements()).toHaveLength(1);
    expect(elements()[0].type).toBe("frame");
  });

  it("renders one accessible shape per element type", () => {
    seed([
      frame("f"),
      rect("r"),
      ellipse("e"),
      line("l"),
      arrow("a"),
      text("t"),
      stamp("s"),
      image("i"),
      pen("p"),
    ]);
    render(<Canvas />);

    for (const type of [
      "frame",
      "rectangle",
      "ellipse",
      "line",
      "arrow",
      "text",
      "stamp",
      "image",
      "pen",
    ]) {
      expect(element(type)).toBeInTheDocument();
    }
  });

  it("does not render elements whose effective state is hidden", () => {
    seed([rect("r", { visible: false })]);
    render(<Canvas />);

    expect(
      screen.queryByRole("button", { name: "rectangle element" })
    ).not.toBeInTheDocument();
  });

  it("renders a page banner for each frame", () => {
    seed([frame("f")]);
    render(<Canvas />);

    expect(
      screen.getByRole("button", { name: PAGE_SETUP })
    ).toBeInTheDocument();
    expect(screen.getByText("f")).toBeInTheDocument();
  });

  it("selects an element when it receives focus in select mode", () => {
    seed([rect("r")]);
    render(<Canvas />);

    fireEvent.focus(element("rectangle"));

    expect(store().selectedElementIds).toEqual(["r"]);
  });

  it("refuses to select or erase a locked element", () => {
    seed([rect("r", { locked: true })]);
    render(<Canvas />);

    fireEvent.mouseDown(element("rectangle"));
    expect(store().selectedElementIds).toEqual([]);

    setTool("eraser");
    fireEvent.mouseDown(element("rectangle"));
    expect(elements()).toHaveLength(1);
  });
});

describe("Canvas drawing", () => {
  const drawWithDrag = (tool: ToolType) => {
    setTool(tool);
    const c = container();
    fireEvent.mouseDown(c, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(c, { clientX: 260, clientY: 220 });
    fireEvent.mouseUp(c);
  };

  it("draws a rectangle and returns to the select tool", () => {
    seed([]);
    render(<Canvas />);

    drawWithDrag("rectangle");

    expect(elements()).toHaveLength(1);
    expect(elements()[0].type).toBe("rectangle");
    expect(store().currentTool).toBe("select");
  });

  it("draws an ellipse", () => {
    seed([]);
    render(<Canvas />);

    drawWithDrag("ellipse");

    expect(elements()[0].type).toBe("ellipse");
  });

  it("draws a line with committed endpoints", () => {
    seed([]);
    render(<Canvas />);

    drawWithDrag("line");

    expect(elements()[0].type).toBe("line");
    expect((elements()[0] as { endX?: number }).endX).toBe(260);
  });

  it("draws an arrow", () => {
    seed([]);
    render(<Canvas />);

    drawWithDrag("arrow");

    expect(elements()[0].type).toBe("arrow");
  });

  it("draws a frame artboard with a background", () => {
    seed([]);
    render(<Canvas />);

    drawWithDrag("frame");

    const created = elements()[0] as FrameElement;
    expect(created.type).toBe("frame");
    expect(created.fillColor).toBeTruthy();
    expect(created.background).toBeTruthy();
  });

  it("adds a text element on a single click and selects it", () => {
    seed([]);
    render(<Canvas />);

    setTool("text");
    fireEvent.mouseDown(container(), { clientX: 120, clientY: 120 });
    fireEvent.mouseUp(container());

    expect(elements()[0].type).toBe("text");
    expect(store().selectedElementIds).toEqual([elements()[0].id]);
    expect(store().currentTool).toBe("select");
  });

  it("adds a stamp using the selected stamp defaults", () => {
    seed([]);
    render(<Canvas />);

    setStamp("hero");
    fireEvent.mouseDown(container(), { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(container());

    const [created] = elements();
    expect(created.type).toBe("stamp");
    expect((created as { stampType: string }).stampType).toBe("hero");
    expect((created as { label: string }).label).toBe("Your Name — Your Title");
  });

  it("draws a freehand pen stroke from accumulated points", () => {
    seed([]);
    render(<Canvas />);

    setTool("pen");
    const c = container();
    fireEvent.mouseDown(c, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(c, { clientX: 150, clientY: 150 });
    fireEvent.mouseMove(c, { clientX: 200, clientY: 180 });
    fireEvent.mouseUp(c);

    const created = elements()[0] as { type: string; points: unknown[] };
    expect(created.type).toBe("pen");
    expect(created.points).toHaveLength(3);
  });

  it("discards a draw that never grew past the minimum size", () => {
    seed([]);
    render(<Canvas />);

    setTool("rectangle");
    const c = container();
    fireEvent.mouseDown(c, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(c);

    expect(elements()).toHaveLength(0);
    expect(store().currentTool).toBe("select");
  });

  it("commits an in-progress draw when the pointer is released on the window", () => {
    seed([]);
    render(<Canvas />);

    setTool("rectangle");
    const c = container();
    fireEvent.mouseDown(c, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(c, { clientX: 200, clientY: 200 });
    fireEvent.pointerUp(window);

    expect(elements()).toHaveLength(1);
    expect(elements()[0].type).toBe("rectangle");
  });
});

describe("Canvas keyboard shortcuts", () => {
  it("switches tools from the letter hotkeys", () => {
    seed([]);
    render(<Canvas />);

    const map: Record<string, string> = {
      v: "select",
      h: "hand",
      r: "rectangle",
      o: "ellipse",
      l: "line",
      a: "arrow",
      t: "text",
      s: "stamp",
      e: "eraser",
    };
    for (const [key, tool] of Object.entries(map)) {
      press(key);
      expect(store().currentTool).toBe(tool);
    }
  });

  it("selects every element with mod+a", () => {
    seed([rect("r1"), rect("r2"), rect("r3")]);
    render(<Canvas />);

    press("a", "a", { ctrlKey: true });

    expect([...store().selectedElementIds].sort()).toEqual(["r1", "r2", "r3"]);
  });

  it("deletes the selection and restores it through undo and redo", () => {
    seed([rect("r1")]);
    render(<Canvas />);
    selectIds(["r1"]);

    press("Backspace");
    expect(elements()).toHaveLength(0);

    press("z", "z", { ctrlKey: true });
    expect(elements()).toHaveLength(1);

    press("z", "z", { ctrlKey: true, shiftKey: true });
    expect(elements()).toHaveLength(0);
  });

  it("duplicates the selection with mod+d", () => {
    seed([rect("r1")]);
    render(<Canvas />);
    selectIds(["r1"]);

    press("d", "d", { ctrlKey: true });

    expect(elements()).toHaveLength(2);
  });

  it("copies and pastes the selection", () => {
    seed([rect("r1")]);
    render(<Canvas />);
    selectIds(["r1"]);

    press("c", "c", { ctrlKey: true });
    press("v", "v", { ctrlKey: true });

    expect(elements()).toHaveLength(2);
    expect(store().selectedElementIds).toHaveLength(1);
  });

  it("nudges the selection with the arrow keys", () => {
    seed([rect("r1", { x: 0, y: 0 })]);
    render(<Canvas />);
    selectIds(["r1"]);

    press("ArrowRight");
    expect(elements()[0].x).toBe(1);

    press("ArrowDown");
    expect(elements()[0].y).toBe(1);

    press("ArrowLeft");
    expect(elements()[0].x).toBe(0);

    press("ArrowUp");
    expect(elements()[0].y).toBe(0);
  });

  it("nudges line endpoints and pen points together", () => {
    seed([line("l", { x: 0, y: 0, endX: 0, endY: 0 }), pen("p")]);
    render(<Canvas />);
    selectIds(["l", "p"]);

    press("ArrowRight");

    expect(elements()[0].x).toBe(1);
    expect((elements()[0] as { endX?: number }).endX).toBe(1);
    const penEl = elements()[1] as { points: { x: number }[] };
    expect(penEl.points[0].x).toBe(1);
  });

  it("nudges children contained inside a selected frame", () => {
    const f = frame("f");
    const child = rect("child", { x: 10, y: 10, frameId: "f" });
    seed([f, child]);
    render(<Canvas />);
    selectIds(["f"]);

    press("ArrowRight");

    const moved = elements().find((el) => el.id === "child");
    expect(moved?.x).toBe(11);
  });

  it("clears the selection and resets the tool on escape", () => {
    seed([rect("r1")]);
    render(<Canvas />);
    selectIds(["r1"]);
    setTool("rectangle");

    press("Escape");

    expect(store().selectedElementIds).toEqual([]);
    expect(store().currentTool).toBe("select");
  });

  it("reorders the selection with mod+] and mod+[", () => {
    seed([rect("r1"), rect("r2")]);
    render(<Canvas />);
    selectIds(["r1"]);

    press("]", "]", { ctrlKey: true });
    expect(elements().map((el) => el.id)).toEqual(["r2", "r1"]);

    press("[", "[", { ctrlKey: true });
    expect(elements().map((el) => el.id)).toEqual(["r1", "r2"]);
  });
});

describe("Canvas pointer interactions", () => {
  it("selects on click and toggles with shift-click", () => {
    seed([rect("r1"), rect("r2")]);
    render(<Canvas />);

    const rects = screen.getAllByRole("button", { name: "rectangle element" });

    fireEvent.mouseDown(rects[0]);
    expect(store().selectedElementIds).toEqual(["r1"]);

    fireEvent.mouseDown(rects[1], { shiftKey: true });
    expect(store().selectedElementIds).toEqual(["r1", "r2"]);

    fireEvent.mouseDown(rects[0], { shiftKey: true });
    expect(store().selectedElementIds).toEqual(["r2"]);
  });

  it("erases the clicked element with the eraser tool", () => {
    seed([rect("r1")]);
    render(<Canvas />);

    setTool("eraser");
    fireEvent.mouseDown(element("rectangle"));

    expect(elements()).toHaveLength(0);
  });

  it("drags a selected element by the pointer delta", () => {
    seed([rect("r1", { x: 0, y: 0 })]);
    render(<Canvas />);

    fireEvent.mouseDown(element("rectangle"), {
      clientX: 10,
      clientY: 10,
    });
    fireEvent.mouseMove(container(), { clientX: 60, clientY: 60 });
    fireEvent.mouseUp(container());

    expect(elements()[0].x).toBe(50);
    expect(elements()[0].y).toBe(50);
  });

  it("marquee-selects only the elements fully enclosed by the box", () => {
    seed([
      rect("inside", { x: 50, y: 50, width: 100, height: 100 }),
      rect("outside", { x: 400, y: 400, width: 100, height: 100 }),
    ]);
    render(<Canvas />);

    const c = container();
    fireEvent.mouseDown(c, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(c, { clientX: 300, clientY: 300 });
    fireEvent.mouseUp(c);

    expect(store().selectedElementIds).toEqual(["inside"]);
  });

  it("pans the viewport while dragging with the hand tool", () => {
    seed([], { x: 0, y: 0, zoom: 1 });
    render(<Canvas />);
    setTool("hand");

    const c = container();
    fireEvent.mouseDown(c, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(c, {
      clientX: 20,
      clientY: 10,
      movementX: 20,
      movementY: 10,
    });
    fireEvent.mouseUp(c);

    expect(store().draft?.viewport.x).toBe(20);
    expect(store().draft?.viewport.y).toBe(10);
  });

  it("pans the viewport with the middle mouse button", () => {
    seed([], { x: 0, y: 0, zoom: 1 });
    render(<Canvas />);

    const c = container();
    fireEvent.mouseDown(c, { button: 1, clientX: 0, clientY: 0 });
    fireEvent.mouseMove(c, {
      clientX: 30,
      clientY: 40,
      movementX: 30,
      movementY: 40,
    });
    fireEvent.mouseUp(c);

    expect(store().draft?.viewport.x).toBe(30);
    expect(store().draft?.viewport.y).toBe(40);
  });

  it("zooms on ctrl+wheel and persists the new zoom", () => {
    vi.useFakeTimers();
    seed([rect("r1")], { x: 0, y: 0, zoom: 1 });
    render(<Canvas />);

    act(() => {
      fireEvent.wheel(container(), {
        clientX: 100,
        clientY: 100,
        ctrlKey: true,
        deltaY: -100,
      });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(store().draft?.viewport.zoom).toBeGreaterThan(1);
  });

  it("pans on wheel scroll and persists the new offset", () => {
    vi.useFakeTimers();
    seed([rect("r1")], { x: 0, y: 0, zoom: 1 });
    render(<Canvas />);

    act(() => {
      fireEvent.wheel(container(), { deltaY: 100 });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(store().draft?.viewport.y).toBe(-100);
  });

  it("pans horizontally with shift+wheel", () => {
    vi.useFakeTimers();
    seed([rect("r1")], { x: 0, y: 0, zoom: 1 });
    render(<Canvas />);

    act(() => {
      fireEvent.wheel(container(), { deltaY: 50, shiftKey: true });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(store().draft?.viewport.x).toBe(-50);
    expect(store().draft?.viewport.y).toBe(0);
  });

  it("prevents the browser context menu on the canvas", () => {
    seed([]);
    render(<Canvas />);

    const event = new MouseEvent("auxclick", {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(container(), event);

    expect(event.defaultPrevented).toBe(true);
  });
});

describe("Canvas inline text editing", () => {
  it("opens the inline editor on a text element and commits the new value", () => {
    seed([text("t", "Old")]);
    render(<Canvas />);

    fireEvent.doubleClick(element("text"));
    const textarea = screen.getByPlaceholderText(
      "Type something"
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Old");

    fireEvent.change(textarea, { target: { value: "New label" } });
    fireEvent.blur(textarea);

    expect((elements()[0] as { text: string }).text).toBe("New label");
  });

  it("edits a stamp label on double-click", () => {
    seed([stamp("s", { label: "Old label" })]);
    render(<Canvas />);

    fireEvent.doubleClick(element("stamp"));
    const textarea = screen.getByPlaceholderText(
      "Type something"
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Old label");

    fireEvent.change(textarea, { target: { value: "New label" } });
    fireEvent.blur(textarea);

    expect((elements()[0] as { label: string }).label).toBe("New label");
  });

  it("cancels the inline editor on escape", () => {
    seed([text("t", "Old")]);
    render(<Canvas />);

    fireEvent.doubleClick(element("text"));
    const textarea = screen.getByPlaceholderText("Type something");
    fireEvent.keyDown(textarea, { key: "Escape" });

    expect(
      screen.queryByPlaceholderText("Type something")
    ).not.toBeInTheDocument();
    expect((elements()[0] as { text: string }).text).toBe("Old");
  });

  it("does not open the editor when a frame is double-clicked", () => {
    seed([frame("f")]);
    render(<Canvas />);

    fireEvent.doubleClick(element("frame"));

    expect(
      screen.queryByPlaceholderText("Type something")
    ).not.toBeInTheDocument();
  });
});
