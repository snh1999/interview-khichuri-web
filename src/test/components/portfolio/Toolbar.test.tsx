import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toolbar } from "@/components/portfolio/sketch/Toolbar.tsx";
import type {
  CanvasElement,
  Portfolio,
} from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios.ts";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore.ts";
import { useBuilderStore } from "@/store/useBuilderStore.ts";
import { render } from "@/test/render.tsx";

const store = () => useSketchBuilderStore.getState();
const elements = () => store().draft?.elements ?? [];

const STAMP_MENU = /Hero Introduction/;
const ARTBOARD_MENU = /Artboard \/ Frame/;
const portfolio = (els: CanvasElement[]): Portfolio => ({
  id: "p-toolbar",
  title: "Toolbar",
  description: "",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  elements: els,
  moodboard: [],
  theme: { ...DEFAULT_THEMES[0] },
  generatedDesigns: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

const seed = (els: CanvasElement[] = []) =>
  useSketchBuilderStore.setState({ draft: portfolio(els) });

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
});

afterEach(() => {
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
});

describe("Toolbar event containment", () => {
  it("does not let a tool mousedown bubble up to the canvas", () => {
    const onAncestorMouseDown = vi.fn();
    const { getByRole } = render(
      // biome-ignore lint/a11y/noNoninteractiveElementInteractions: test wrapper; only observes whether the event bubbles this far
      // biome-ignore lint/a11y/noStaticElementInteractions: test wrapper; only observes whether the event bubbles this far
      <div onMouseDown={onAncestorMouseDown}>
        <Toolbar />
      </div>
    );

    fireEvent.mouseDown(getByRole("button", { name: "Select (V)" }));

    expect(onAncestorMouseDown).not.toHaveBeenCalled();
  });
});

describe("Toolbar tool buttons", () => {
  it("activates the current tool for each tool button", () => {
    render(<Toolbar />);

    const tools: [string, string][] = [
      ["Select (V)", "select"],
      ["Hand / Pan (H)", "hand"],
      ["Rectangle (R)", "rectangle"],
      ["Ellipse (O)", "ellipse"],
      ["Line (L)", "line"],
      ["Arrow (A)", "arrow"],
      ["Text Block (T)", "text"],
    ];

    for (const [label, tool] of tools) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(store().currentTool).toBe(tool);
    }
  });

  it("activates the eraser tool", async () => {
    const { user } = render(<Toolbar />);

    await user.click(screen.getByRole("button", { name: "Eraser (E)" }));

    expect(store().currentTool).toBe("eraser");
  });

  it("switches to the stamp tool when the stamps library is opened", async () => {
    const { user } = render(<Toolbar />);

    await user.click(screen.getByRole("button", { name: "UI Stamps Library" }));

    expect(store().currentTool).toBe("stamp");
  });

  it("records the selected stamp type from the library menu", async () => {
    const { user } = render(<Toolbar />);

    await user.click(screen.getByRole("button", { name: "UI Stamps Library" }));
    await user.click(await screen.findByRole("menuitem", { name: STAMP_MENU }));

    expect(store().selectedStamp).toBe("hero");
    expect(store().currentTool).toBe("stamp");
  });

  it("creates and selects an artboard frame from the library menu", async () => {
    seed();
    const { user } = render(<Toolbar />);

    await user.click(screen.getByRole("button", { name: "UI Stamps Library" }));
    await user.click(
      await screen.findByRole("menuitem", { name: ARTBOARD_MENU })
    );

    const frames = elements().filter((el) => el.type === "frame");
    expect(frames).toHaveLength(1);
    expect(store().selectedElementIds).toEqual([frames[0].id]);
    expect(store().currentTool).toBe("select");
  });
});
