// @vitest-environment jsdom
import { act, fireEvent, renderHook, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RightSidebar } from "@/components/portfolio/sketch/RightSidebar";
import { AlignmentTools } from "@/components/portfolio/sketch/right/AlignmentTools";
import { ColorControls } from "@/components/portfolio/sketch/right/ColorControls";
import { toValidHex6 } from "@/components/portfolio/sketch/right/constants";
import { FrameControls } from "@/components/portfolio/sketch/right/FrameControls";
import { GeometryEditor } from "@/components/portfolio/sketch/right/GeometryEditor";
import { LayerControls } from "@/components/portfolio/sketch/right/LayerControls";
import { RightSidebarEmpty } from "@/components/portfolio/sketch/right/RightSidebarEmpty";
import { SliderControls } from "@/components/portfolio/sketch/right/SliderControls";
import { StampEditor } from "@/components/portfolio/sketch/right/StampEditor";
import { TypographyEditor } from "@/components/portfolio/sketch/right/TypographyEditor";
import { useBatchUpdate } from "@/components/portfolio/sketch/right/useBatchUpdate";
import { useSelectionState } from "@/components/portfolio/sketch/right/useSelectionState";
import type {
  CanvasElement,
  FrameElement,
  Portfolio,
  ShapeElement,
  StampElement,
  TextElement,
} from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import { useBuilderStore } from "@/store/useBuilderStore";
import { render } from "@/test/render";

const ADD_THIS_PAGE = /Add This Page/;

const makePortfolio = (elements: CanvasElement[] = []): Portfolio => ({
  id: "portfolio-test",
  title: "Test Portfolio",
  description: "",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  elements,
  moodboard: [],
  theme: { ...DEFAULT_THEMES[0] },
  generatedDesigns: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

const makeRect = (overrides: Partial<ShapeElement> = {}): ShapeElement => ({
  id: "rect-1",
  type: "rectangle",
  x: 10,
  y: 20,
  width: 100,
  height: 50,
  strokeColor: "#334155",
  fillColor: "#f8fafc",
  strokeWidth: 2,
  opacity: 1,
  cornerRadius: 12,
  zIndex: 1,
  ...overrides,
});

const makeText = (overrides: Partial<TextElement> = {}): TextElement => ({
  id: "text-1",
  type: "text",
  x: 10,
  y: 20,
  width: 120,
  height: 40,
  text: "Hello",
  fontSize: 16,
  fontFamily: "sans-serif",
  fontWeight: "normal",
  strokeColor: "#334155",
  fillColor: "#f8fafc",
  strokeWidth: 2,
  opacity: 1,
  cornerRadius: 0,
  zIndex: 1,
  ...overrides,
});

const makeFrame = (overrides: Partial<FrameElement> = {}): FrameElement => ({
  id: "frame-1",
  type: "frame",
  title: "Home",
  route: "/",
  preset: "desktop",
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  strokeWidth: 2,
  opacity: 1,
  zIndex: 1,
  ...overrides,
});

const makeStamp = (overrides: Partial<StampElement> = {}): StampElement => ({
  id: "stamp-1",
  type: "stamp",
  stampType: "hero",
  label: "Label",
  sublabel: "Sub",
  x: 0,
  y: 0,
  width: 200,
  height: 80,
  strokeWidth: 1,
  opacity: 1,
  zIndex: 1,
  ...overrides,
});

const seed = (elements: CanvasElement[], selected: string[] = []) => {
  useSketchBuilderStore.setState({
    draft: makePortfolio(elements),
    selectedElementIds: selected,
  });
};

const seedTheme = (
  theme: Portfolio["theme"],
  elements: CanvasElement[] = []
) => {
  useSketchBuilderStore.setState({
    draft: { ...makePortfolio(elements), theme },
    selectedElementIds: [],
  });
};

const elementById = (id: string): CanvasElement | undefined =>
  useSketchBuilderStore.getState().draft?.elements.find((el) => el.id === id);

beforeEach(() => {
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
});

afterEach(() => {
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
});

describe("toValidHex6", () => {
  it("returns the default fallback for missing or non-string input", () => {
    expect(toValidHex6()).toBe("#ffffff");
    expect(toValidHex6("")).toBe("#ffffff");
    expect(toValidHex6(undefined, "#123456")).toBe("#123456");
  });

  it("keeps a valid six-digit hex and trims surrounding whitespace", () => {
    expect(toValidHex6("#A1b2C3")).toBe("#A1b2C3");
    expect(toValidHex6("  #a1b2c3  ")).toBe("#a1b2c3");
  });

  it("truncates eight-digit hex to six", () => {
    expect(toValidHex6("#11223344")).toBe("#112233");
  });

  it("expands shorthand three-digit hex", () => {
    expect(toValidHex6("#abc")).toBe("#aabbcc");
  });

  it("falls back for values that are not hex colours", () => {
    expect(toValidHex6("rebeccapurple")).toBe("#ffffff");
    expect(toValidHex6("#12", "#000000")).toBe("#000000");
  });
});

describe("useBatchUpdate", () => {
  it("applies the same changes to every selected element", () => {
    const a = makeRect({ id: "a", x: 1 });
    const b = makeRect({ id: "b", x: 2 });
    seed([a, b]);

    const { result } = renderHook(() =>
      useBatchUpdate([{ id: "a" }, { id: "b" }])
    );

    act(() => {
      result.current({ x: 99 });
    });

    expect(elementById("a")?.x).toBe(99);
    expect(elementById("b")?.x).toBe(99);
  });

  it("records one history entry for a burst of updates (debounced)", () => {
    const a = makeRect({ id: "a" });
    seed([a]);

    const { result } = renderHook(() => useBatchUpdate([{ id: "a" }]));

    act(() => {
      result.current({ x: 1 });
      result.current({ x: 2 });
      result.current({ x: 3 });
    });

    expect(useSketchBuilderStore.getState().history.past).toHaveLength(1);
  });

  it("skips recording history when shouldRecordHistory is false", () => {
    const a = makeRect({ id: "a" });
    seed([a]);

    const { result } = renderHook(() => useBatchUpdate([{ id: "a" }]));

    act(() => {
      result.current({ x: 5 }, false);
    });

    expect(useSketchBuilderStore.getState().history.past).toHaveLength(0);
    expect(elementById("a")?.x).toBe(5);
  });

  it("starts a fresh entry after an undo inside the debounce window", () => {
    const a = makeRect({ id: "a" });
    seed([a]);

    const { result } = renderHook(() => useBatchUpdate([{ id: "a" }]));

    act(() => {
      result.current({ x: 1 });
    });
    expect(useSketchBuilderStore.getState().history.past).toHaveLength(1);

    act(() => {
      useSketchBuilderStore.getState().undo();
    });
    expect(useSketchBuilderStore.getState().history.past).toHaveLength(0);

    act(() => {
      result.current({ x: 2 });
    });
    expect(useSketchBuilderStore.getState().history.past).toHaveLength(1);
  });
});

describe("useSelectionState", () => {
  it("reports an empty, unlocked selection when nothing is selected", () => {
    seed([makeRect()], []);

    const { result } = renderHook(() => useSelectionState());

    expect(result.current.selectedElements).toHaveLength(0);
    expect(result.current.activeElement).toBeUndefined();
    expect(result.current.isMulti).toBe(false);
    expect(result.current.isFrame).toBe(false);
    expect(result.current.isText).toBe(false);
    expect(result.current.isStamp).toBe(false);
    expect(result.current.isLocked).toBe(false);
    expect(result.current.strokeWidthState.isMixed).toBe(false);
  });

  it("flags a single frame selection", () => {
    const frame = makeFrame();
    seed([frame], [frame.id]);

    const { result } = renderHook(() => useSelectionState());

    expect(result.current.isFrame).toBe(true);
    expect(result.current.isText).toBe(false);
    expect(result.current.activeElement?.id).toBe(frame.id);
  });

  it("flags text and stamp selections", () => {
    const text = makeText();
    seed([text], [text.id]);
    const textState = renderHook(() => useSelectionState());
    expect(textState.result.current.isText).toBe(true);
    expect(textState.result.current.isStamp).toBe(false);

    const stamp = makeStamp();
    seed([stamp], [stamp.id]);
    const stampState = renderHook(() => useSelectionState());
    expect(stampState.result.current.isStamp).toBe(true);
    expect(stampState.result.current.isText).toBe(false);
  });

  it("detects mixed per-property values across a multi-selection", () => {
    const a = makeRect({
      id: "a",
      strokeWidth: 2,
      opacity: 1,
      fillColor: "#fff",
    });
    const b = makeRect({
      id: "b",
      strokeWidth: 8,
      opacity: 1,
      fillColor: "#000",
    });
    seed([a, b], ["a", "b"]);

    const { result } = renderHook(() => useSelectionState());

    expect(result.current.isMulti).toBe(true);
    expect(result.current.strokeWidthState.isMixed).toBe(true);
    expect(result.current.strokeWidthState.value).toBeUndefined();
    expect(result.current.fillColorState.isMixed).toBe(true);
    expect(result.current.opacityState.isMixed).toBe(false);
  });

  it("inherits a lock from the owning frame", () => {
    const frame = makeFrame({ locked: true });
    const child = makeRect({ id: "child", frameId: frame.id });
    seed([frame, child], [child.id]);

    const { result } = renderHook(() => useSelectionState());

    expect(result.current.isLocked).toBe(true);
  });

  it("deduplicates theme swatch colours", () => {
    const theme = {
      ...DEFAULT_THEMES[0],
      surfaceColor: DEFAULT_THEMES[0].backgroundColor,
    };
    seedTheme(theme);

    const { result } = renderHook(() => useSelectionState());

    const expected = Array.from(
      new Set([
        theme.primaryColor,
        theme.secondaryColor,
        theme.accentColor,
        theme.surfaceColor,
        theme.backgroundColor,
        theme.textColor,
        theme.textMutedColor,
      ])
    );
    expect(result.current.themeSwatches).toEqual(expected);
    expect(result.current.themeSwatches.length).toBeLessThan(7);
  });
});

describe("RightSidebar empty state", () => {
  it("shows the inspector placeholder with the active theme", () => {
    seed([], []);
    render(<RightSidebar />);

    expect(screen.getByText("Inspector & Styles")).toBeInTheDocument();
    expect(screen.getByText("Active Palette")).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_THEMES[0].name)).toBeInTheDocument();
  });

  it("sets the active stroke and fill colours from a palette swatch", async () => {
    seed([], []);
    const { user } = render(<RightSidebar />);

    await user.click(
      screen.getByRole("button", {
        name: `Select ${DEFAULT_THEMES[0].primaryColor}`,
      })
    );

    const state = useSketchBuilderStore.getState();
    expect(state.strokeColor).toBe(DEFAULT_THEMES[0].primaryColor);
    expect(state.fillColor).toBe(DEFAULT_THEMES[0].primaryColor);
  });

  it("falls back to the Custom label when no theme name is supplied", () => {
    render(<RightSidebarEmpty themeSwatches={["#111111"]} />);

    expect(screen.getByText("Custom")).toBeInTheDocument();
  });
});

describe("RightSidebar single selection", () => {
  it("renders the editors for a selected text element", () => {
    const text = makeText({ id: "t1", name: "Tagline" });
    seed([text], [text.id]);
    render(<RightSidebar />);

    expect(screen.getByText("Tagline")).toBeInTheDocument();
    expect(screen.getByText("Geometry (px)")).toBeInTheDocument();
    expect(screen.getByText("Typography & Text")).toBeInTheDocument();
    expect(screen.getByText("Stroke & Fill Colors")).toBeInTheDocument();
    expect(screen.getByText("Stroke Width")).toBeInTheDocument();
    expect(screen.getByText("Layer Hierarchy")).toBeInTheDocument();
    expect(screen.queryByText("Align Selection")).not.toBeInTheDocument();
  });

  it("updates the element text through the typography editor", async () => {
    const text = makeText({ id: "t1", text: "Old" });
    seed([text], [text.id]);
    const { user } = render(<RightSidebar />);

    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "New headline");

    expect((elementById("t1") as TextElement).text).toBe("New headline");
  });

  it("applies a font size preset and records the store font size", async () => {
    const text = makeText({ id: "t1", fontSize: 16 });
    seed([text], [text.id]);
    const { user } = render(<RightSidebar />);

    await user.click(screen.getByRole("button", { name: "28" }));

    expect((elementById("t1") as TextElement).fontSize).toBe(28);
    expect(useSketchBuilderStore.getState().fontSize).toBe(28);
  });

  it("shows frame-specific artboard controls for a selected frame", () => {
    const frame = makeFrame({ id: "f1" });
    seed([frame], [frame.id]);
    render(<RightSidebar />);

    expect(screen.getByText("Artboard Properties")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ADD_THIS_PAGE })
    ).toBeInTheDocument();
    expect(screen.queryByText("Stroke & Fill Colors")).not.toBeInTheDocument();
  });

  it("disables the editor and explains why when the selection is locked", () => {
    const rect = makeRect({ id: "r1", locked: true });
    seed([rect], [rect.id]);
    render(<RightSidebar />);

    expect(
      screen.getByText("Locked — unlock this element to edit")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("spinbutton")[0]).toBeDisabled();
  });

  it("uses page wording in the locked notice for a locked frame", () => {
    const frame = makeFrame({ id: "f1", locked: true });
    seed([frame], [frame.id]);
    render(<RightSidebar />);

    expect(
      screen.getByText("Locked — unlock this page to edit")
    ).toBeInTheDocument();
  });
});

describe("RightSidebar multi selection", () => {
  it("shows alignment tools and a batch-editing indicator", () => {
    const a = makeRect({ id: "a", x: 0 });
    const b = makeRect({ id: "b", x: 200 });
    seed([a, b], ["a", "b"]);
    render(<RightSidebar />);

    expect(screen.getByText("2 Items Selected")).toBeInTheDocument();
    expect(screen.getByText("Align Selection")).toBeInTheDocument();
    expect(screen.getByText("Batch editing 2 items")).toBeInTheDocument();
  });
});

describe("SelectionHeader actions", () => {
  it("duplicates the selection from the header button", async () => {
    const rect = makeRect({ id: "r1" });
    seed([rect], [rect.id]);
    const { user } = render(<RightSidebar />);

    await user.click(
      screen.getByRole("button", { name: "Duplicate (Ctrl+D)" })
    );

    expect(useSketchBuilderStore.getState().draft?.elements).toHaveLength(2);
  });

  it("deletes the selection after confirming the dialog", async () => {
    const rect = makeRect({ id: "r1" });
    seed([rect], [rect.id]);
    const { user } = render(<RightSidebar />);

    await user.click(
      screen.getByRole("button", { name: "Delete (Del / Backspace)" })
    );
    expect(await screen.findByText("Delete Selected")).toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    expect(useSketchBuilderStore.getState().draft?.elements).toHaveLength(0);
  });
});

describe("AlignmentTools", () => {
  it("aligns selected elements to the leftmost edge", async () => {
    const a = makeRect({ id: "a", x: 10, width: 100 });
    const b = makeRect({ id: "b", x: 200, width: 50 });
    seed([a, b], ["a", "b"]);
    const { user } = render(<AlignmentTools />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(6);
    await user.click(buttons[0]);

    expect(elementById("a")?.x).toBe(10);
    expect(elementById("b")?.x).toBe(10);
  });

  it("aligns selected elements to the topmost edge", async () => {
    const a = makeRect({ id: "a", y: 5 });
    const b = makeRect({ id: "b", y: 300 });
    seed([a, b], ["a", "b"]);
    const { user } = render(<AlignmentTools />);

    await user.click(screen.getAllByRole("button")[3]);

    expect(elementById("a")?.y).toBe(5);
    expect(elementById("b")?.y).toBe(5);
  });
});

describe("LayerControls", () => {
  it("brings the selected element to the front", async () => {
    const a = makeRect({ id: "a", zIndex: 1 });
    const b = makeRect({ id: "b", zIndex: 2 });
    const c = makeRect({ id: "c", zIndex: 3 });
    seed([a, b, c], ["b"]);
    const { user } = render(<LayerControls />);

    await user.click(screen.getByRole("button", { name: "Front" }));

    expect(elementById("b")?.zIndex).toBe(3);
  });

  it("sends the selected element backward one layer", async () => {
    const a = makeRect({ id: "a", zIndex: 1 });
    const b = makeRect({ id: "b", zIndex: 2 });
    const c = makeRect({ id: "c", zIndex: 3 });
    seed([a, b, c], ["b"]);
    const { user } = render(<LayerControls />);

    await user.click(screen.getByRole("button", { name: "Backward" }));

    expect(elementById("b")?.zIndex).toBe(1);
  });
});

describe("FrameControls", () => {
  it("updates the frame route and opens the AI modal for the page", async () => {
    const frame = makeFrame({ id: "f1", route: "/" });
    seed([frame], [frame.id]);
    const { user } = render(<FrameControls activeElement={frame} />);

    const routeInput = screen.getByRole("textbox");
    fireEvent.change(routeInput, { target: { value: "/about" } });
    expect((elementById("f1") as FrameElement).route).toBe("/about");

    await user.click(screen.getByRole("button", { name: ADD_THIS_PAGE }));

    const state = useSketchBuilderStore.getState();
    expect(state.activeFrameIdForAi).toBe("f1");
    expect(state.isAiModalOpen).toBe(true);
    expect(state.aiModalTargetFrameId).toBe("f1");
    expect(state.aiModalMode).toBe("append");
  });
});

describe("StampEditor", () => {
  it("edits the stamp label and sublabel", () => {
    const stamp = makeStamp({ id: "s1", label: "Old", sublabel: "Old sub" });
    seed([stamp], [stamp.id]);
    render(<StampEditor activeElement={stamp} />);

    fireEvent.change(screen.getByPlaceholderText("Header / Title"), {
      target: { value: "New label" },
    });
    fireEvent.change(screen.getByPlaceholderText("Subtext / Details"), {
      target: { value: "New sub" },
    });

    expect((elementById("s1") as StampElement).label).toBe("New label");
    expect((elementById("s1") as StampElement).sublabel).toBe("New sub");
  });
});

describe("TypographyEditor", () => {
  it("changes font family, weight and text content", async () => {
    const text = makeText({ id: "t1", text: "Hello" });
    seed([text], [text.id]);
    const { user } = render(<TypographyEditor activeElement={text} />);

    const comboboxes = screen.getAllByRole("combobox");
    await user.click(comboboxes[0]);
    await user.click(await screen.findByRole("option", { name: "Serif" }));
    expect((elementById("t1") as TextElement).fontFamily).toBe("serif");

    await user.click(screen.getAllByRole("combobox")[1]);
    await user.click(await screen.findByRole("option", { name: "Bold (700)" }));
    expect((elementById("t1") as TextElement).fontWeight).toBe("bold");

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Edited copy" },
    });
    expect((elementById("t1") as TextElement).text).toBe("Edited copy");
  });
});

describe("ColorControls", () => {
  const createProps = (
    overrides: Partial<ComponentProps<typeof ColorControls>> = {}
  ) => ({
    activeElement: makeRect({
      id: "c1",
      strokeColor: "transparent",
      fillColor: "#ffffff",
    }),
    fillColorState: { isMixed: false },
    strokeColorState: { isMixed: false },
    theme: DEFAULT_THEMES[0],
    themeSwatches: ["#111111", "#222222"],
    updateSelected: vi.fn(),
    ...overrides,
  });

  it("toggles stroke transparency using the theme text colour", async () => {
    const props = createProps();
    const { user } = render(<ColorControls {...props} />);

    await user.click(screen.getByRole("button", { name: "None" }));

    expect(props.updateSelected).toHaveBeenCalledWith({
      strokeColor: DEFAULT_THEMES[0].textColor,
    });
    expect(useSketchBuilderStore.getState().strokeColor).toBe(
      DEFAULT_THEMES[0].textColor
    );
  });

  it("toggles fill to transparent", async () => {
    const props = createProps();
    const { user } = render(<ColorControls {...props} />);

    await user.click(screen.getByRole("button", { name: "Color" }));

    expect(props.updateSelected).toHaveBeenCalledWith({
      fillColor: "transparent",
    });
    expect(useSketchBuilderStore.getState().fillColor).toBe("transparent");
  });

  it("applies a theme swatch to stroke and fill", async () => {
    const props = createProps();
    const { user } = render(<ColorControls {...props} />);

    await user.click(screen.getByRole("button", { name: "#111111" }));

    expect(props.updateSelected).toHaveBeenCalledWith({
      strokeColor: "#111111",
      fillColor: "#11111122",
    });
    expect(useSketchBuilderStore.getState().strokeColor).toBe("#111111");
    expect(useSketchBuilderStore.getState().fillColor).toBe("#11111122");
  });

  it("updates stroke and fill from the colour inputs", () => {
    const props = createProps();
    const { container } = render(<ColorControls {...props} />);

    const colorInputs = container.querySelectorAll<HTMLInputElement>(
      'input[type="color"]'
    );
    fireEvent.change(colorInputs[0], { target: { value: "#abcdef" } });
    fireEvent.change(colorInputs[1], { target: { value: "#123456" } });

    expect(props.updateSelected).toHaveBeenCalledWith({
      strokeColor: "#abcdef",
    });
    expect(props.updateSelected).toHaveBeenCalledWith({
      fillColor: "#123456",
    });
  });

  it("shows a mixed indicator when colours differ across a selection", () => {
    const props = createProps({
      strokeColorState: { isMixed: true },
      fillColorState: { isMixed: true },
    });
    render(<ColorControls {...props} />);

    expect(screen.getByText("Mixed Colors")).toBeInTheDocument();
    expect(screen.getAllByText("Mixed")).toHaveLength(2);
  });
});

describe("GeometryEditor", () => {
  it("updates a single element's position and size", () => {
    const rect = makeRect({ id: "g1", x: 10, y: 20, width: 100, height: 50 });
    const updateSelected = vi.fn();
    render(
      <GeometryEditor
        activeElement={rect}
        isMulti={false}
        selectedElements={[rect]}
        updateSelected={updateSelected}
      />
    );

    const fields = screen.getAllByRole("spinbutton");
    fireEvent.change(fields[0], { target: { value: "100" } });
    fireEvent.change(fields[2], { target: { value: "5" } });
    fireEvent.change(fields[3], { target: { value: "80" } });

    expect(updateSelected).toHaveBeenCalledWith({ x: 100 });
    expect(updateSelected).toHaveBeenCalledWith({ width: 10 });
    expect(updateSelected).toHaveBeenCalledWith({ height: 80 });
  });

  it("applies position deltas to every element in a multi-selection", () => {
    const a = makeRect({ id: "a", x: 10, y: 10 });
    const b = makeRect({ id: "b", x: 50, y: 40 });
    seed([a, b]);
    const updateSelected = vi.fn();
    render(
      <GeometryEditor
        activeElement={a}
        isMulti
        selectedElements={[a, b]}
        updateSelected={updateSelected}
      />
    );

    expect(screen.getByText("Batch editing 2 items")).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole("spinbutton")[0], {
      target: { value: "210" },
    });

    expect(elementById("a")?.x).toBe(210);
    expect(elementById("b")?.x).toBe(250);
    expect(updateSelected).not.toHaveBeenCalled();
  });

  it("moves a frame's contained children when its X changes", () => {
    const frameEl = makeFrame({ id: "f1", x: 100, y: 50 });
    const child = makeStamp({ id: "s1", x: 140, y: 80, frameId: "f1" });
    seed([frameEl, child]);

    render(
      <GeometryEditor
        activeElement={frameEl}
        isMulti={false}
        selectedElements={[frameEl]}
        updateSelected={vi.fn()}
      />
    );

    fireEvent.change(screen.getAllByRole("spinbutton")[0], {
      target: { value: "160" },
    });

    expect(elementById("f1")?.x).toBe(160);
    expect(elementById("s1")?.x).toBe(200);
  });
});

describe("SliderControls", () => {
  it("updates stroke width, opacity and corner radius", () => {
    const rect = makeRect({ id: "s1" });
    const updateSelected = vi.fn();
    render(
      <SliderControls
        activeElement={rect}
        cornerRadiusState={{ isMixed: false }}
        opacityState={{ isMixed: false }}
        strokeWidthState={{ isMixed: false }}
        updateSelected={updateSelected}
      />
    );

    const fields = screen.getAllByRole("spinbutton");
    fireEvent.change(fields[0], { target: { value: "30" } });
    fireEvent.change(fields[1], { target: { value: "150" } });
    fireEvent.change(fields[2], { target: { value: "20" } });

    expect(updateSelected).toHaveBeenCalledWith({ strokeWidth: 30 });
    expect(updateSelected).toHaveBeenCalledWith({ opacity: 1 });
    expect(updateSelected).toHaveBeenCalledWith({ cornerRadius: 20 });
    const state = useSketchBuilderStore.getState();
    expect(state.strokeWidth).toBe(30);
    expect(state.opacity).toBe(1);
    expect(state.cornerRadius).toBe(20);
  });

  it("clamps opacity input to the 0-100 range", () => {
    const rect = makeRect({ id: "s1" });
    const updateSelected = vi.fn();
    render(
      <SliderControls
        activeElement={rect}
        cornerRadiusState={{ isMixed: false }}
        opacityState={{ isMixed: false }}
        strokeWidthState={{ isMixed: false }}
        updateSelected={updateSelected}
      />
    );

    fireEvent.change(screen.getAllByRole("spinbutton")[1], {
      target: { value: "-5" },
    });
    expect(updateSelected).toHaveBeenCalledWith({ opacity: 0 });
  });

  it("shows mixed indicators and blank inputs for divergent values", () => {
    const rect = makeRect({ id: "s1" });
    render(
      <SliderControls
        activeElement={rect}
        cornerRadiusState={{ isMixed: true }}
        opacityState={{ isMixed: true }}
        strokeWidthState={{ isMixed: true }}
        updateSelected={vi.fn()}
      />
    );

    expect(screen.getAllByText("Mixed")).toHaveLength(3);
    const fields = screen.getAllByRole("spinbutton");
    expect(fields[0]).toHaveValue(null);
  });
});
