import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiModalEmptyState } from "@/components/portfolio/sketch/ai/AiModalEmptyState";
import { FrameStep } from "@/components/portfolio/sketch/ai/FrameStep";
import { StyleStep } from "@/components/portfolio/sketch/ai/StyleStep";
import { STYLE_PRESETS } from "@/components/portfolio/sketch/ai/stylePresets";
import type {
  CanvasElement,
  FrameElement,
  StampElement,
} from "@/components/portfolio/sketch/types";
import { render } from "@/test/render";

const RE_HOME_MOBILE = /Home Mobile/;
const RE_TWO_COMPONENTS = /2 components/;
const RE_HOME_DESKTOP = /Home Desktop/;
const RE_MODULES = /Detected Wireframe Modules/;
const RE_THREE_MODULES = /Detected Wireframe Modules \(3 elements\)/;
const RE_WARM_SUNSET = /Warm Sunset & Terracotta/;
const RE_HEX_COLOR = /^#/;

const frame = (overrides: Partial<FrameElement> = {}): FrameElement => ({
  id: "f1",
  type: "frame",
  title: "Home Desktop",
  route: "/",
  preset: "desktop",
  x: 0,
  y: 0,
  width: 1040,
  height: 720,
  zIndex: 1,
  ...overrides,
});

const stamp = (overrides: Partial<StampElement> = {}): StampElement => ({
  id: "s1",
  type: "stamp",
  stampType: "hero",
  x: 10,
  y: 10,
  width: 100,
  height: 50,
  zIndex: 2,
  ...overrides,
});

describe("FrameStep", () => {
  const noopProps = {
    onClear: vi.fn(),
    onSelectAll: vi.fn(),
    onToggleFrame: vi.fn(),
  };

  it("groups frames by route and counts their child elements", () => {
    const frames = [
      frame({ id: "f1", title: "Home Desktop", route: "/" }),
      frame({
        id: "f2",
        title: "Home Mobile",
        route: "/",
        preset: "mobile",
        x: 2000,
      }),
    ];
    const elements: CanvasElement[] = [
      stamp({ id: "s1", frameId: "f1" }),
      stamp({ id: "s2", frameId: "f1" }),
    ];

    render(
      <FrameStep
        {...noopProps}
        activeFrames={[]}
        detectedElementCount={0}
        detectedSections={[]}
        elements={elements}
        frames={frames}
        selectedFrameIds={[]}
      />
    );

    expect(screen.getByText("Page 1")).toBeInTheDocument();
    expect(screen.getByText("2 artboards · one page")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: RE_HOME_MOBILE })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: RE_TWO_COMPONENTS })
    ).toBeInTheDocument();
  });

  it("fires select-all and clear callbacks with their enabled states", async () => {
    const frames = [frame({ id: "f1" }), frame({ id: "f2", title: "About" })];
    const onSelectAll = vi.fn();
    const onClear = vi.fn();
    const onToggleFrame = vi.fn();

    const { rerender, user } = render(
      <FrameStep
        activeFrames={[]}
        detectedElementCount={0}
        detectedSections={[]}
        elements={[]}
        frames={frames}
        onClear={onClear}
        onSelectAll={onSelectAll}
        onToggleFrame={onToggleFrame}
        selectedFrameIds={[]}
      />
    );

    expect(screen.getByRole("button", { name: "Select all" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Select all" }));
    expect(onSelectAll).toHaveBeenCalledTimes(1);

    rerender(
      <FrameStep
        activeFrames={[]}
        detectedElementCount={0}
        detectedSections={[]}
        elements={[]}
        frames={frames}
        onClear={onClear}
        onSelectAll={onSelectAll}
        onToggleFrame={onToggleFrame}
        selectedFrameIds={["f1", "f2"]}
      />
    );

    expect(screen.getByRole("button", { name: "Select all" })).toBeDisabled();
    const clear = screen.getByRole("button", { name: "Clear" });
    expect(clear).toBeEnabled();
    await user.click(clear);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("shows detected wireframe modules only for active frames", () => {
    const frames = [frame({ id: "f1" })];

    const { rerender } = render(
      <FrameStep
        activeFrames={[]}
        detectedElementCount={0}
        detectedSections={[]}
        elements={[]}
        frames={frames}
        onClear={vi.fn()}
        onSelectAll={vi.fn()}
        onToggleFrame={vi.fn()}
        selectedFrameIds={[]}
      />
    );
    expect(screen.queryByText(RE_MODULES)).not.toBeInTheDocument();

    rerender(
      <FrameStep
        activeFrames={[frames[0]]}
        detectedElementCount={3}
        detectedSections={["hero", "navbar"]}
        elements={[]}
        frames={frames}
        onClear={vi.fn()}
        onSelectAll={vi.fn()}
        onToggleFrame={vi.fn()}
        selectedFrameIds={["f1"]}
      />
    );
    expect(screen.getByText(RE_THREE_MODULES)).toBeInTheDocument();
    expect(screen.getByText("hero")).toBeInTheDocument();
    expect(screen.getByText("navbar")).toBeInTheDocument();
  });

  it("falls back to the standard-layout copy when no sections are detected", () => {
    const active = frame({ id: "f1" });
    render(
      <FrameStep
        activeFrames={[active]}
        detectedElementCount={0}
        detectedSections={[]}
        elements={[]}
        frames={[active]}
        onClear={vi.fn()}
        onSelectAll={vi.fn()}
        onToggleFrame={vi.fn()}
        selectedFrameIds={["f1"]}
      />
    );

    expect(
      screen.getByText(
        "Standard layout structure (wireframe stamps will be synthesized)"
      )
    ).toBeInTheDocument();
  });

  it("invokes the frame toggle with the clicked frame id", async () => {
    const onToggleFrame = vi.fn();
    const { user } = render(
      <FrameStep
        activeFrames={[]}
        detectedElementCount={0}
        detectedSections={[]}
        elements={[]}
        frames={[frame({ id: "f1" })]}
        onClear={vi.fn()}
        onSelectAll={vi.fn()}
        onToggleFrame={onToggleFrame}
        selectedFrameIds={[]}
      />
    );

    await user.click(screen.getByRole("button", { name: RE_HOME_DESKTOP }));
    expect(onToggleFrame).toHaveBeenCalledWith("f1");
  });
});

describe("StyleStep", () => {
  it("renders every saved style preset", () => {
    render(
      <StyleStep onSelectPreset={vi.fn()} selectedPresetId="dark-luxury" />
    );

    for (const preset of STYLE_PRESETS) {
      expect(
        screen.getByRole("button", { name: new RegExp(preset.name) })
      ).toBeInTheDocument();
    }
  });

  it("reports the clicked preset id", async () => {
    const onSelectPreset = vi.fn();
    const { user } = render(
      <StyleStep onSelectPreset={onSelectPreset} selectedPresetId="cyber-dev" />
    );

    await user.click(screen.getByRole("button", { name: RE_WARM_SUNSET }));
    expect(onSelectPreset).toHaveBeenCalledWith("warm-sunset");
  });
});

describe("AiModalEmptyState", () => {
  it("renders the empty-state copy and fires onCreateFrame", async () => {
    const onCreateFrame = vi.fn();
    const { user } = render(
      <AiModalEmptyState onCreateFrame={onCreateFrame} />
    );

    expect(
      screen.getByRole("heading", { name: "No Artboards on Canvas" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Create Desktop Frame (1040x720)" })
    );
    expect(onCreateFrame).toHaveBeenCalledTimes(1);
  });
});

describe("STYLE_PRESETS", () => {
  it("exposes unique, complete, well-formed presets", () => {
    expect(STYLE_PRESETS.length).toBeGreaterThan(0);
    const ids = STYLE_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("dark-luxury");

    for (const preset of STYLE_PRESETS) {
      for (const key of [
        "id",
        "name",
        "vibe",
        "badge",
        "primary",
        "accent",
        "bg",
        "surface",
        "textColor",
        "font",
      ] as const) {
        expect(preset[key].length).toBeGreaterThan(0);
      }
      expect(preset.primary).toMatch(RE_HEX_COLOR);
      expect(preset.accent).toMatch(RE_HEX_COLOR);
      expect(preset.bg).toMatch(RE_HEX_COLOR);
    }
  });
});
