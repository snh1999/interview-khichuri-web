import { screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LeftSidebar } from "@/components/portfolio/sketch/LeftSidebar.tsx";
import { AddFramePresets } from "@/components/portfolio/sketch/left/AddFramePresets.tsx";
import { getElementIcon } from "@/components/portfolio/sketch/left/elementIcon.tsx";
import { FrameTree } from "@/components/portfolio/sketch/left/FrameTree.tsx";
import { LibraryTab } from "@/components/portfolio/sketch/left/LibraryTab.tsx";
import { LooseElements } from "@/components/portfolio/sketch/left/LooseElements.tsx";
import { PagesTab } from "@/components/portfolio/sketch/left/PagesTab.tsx";
import { SidebarTabs } from "@/components/portfolio/sketch/left/SidebarTabs.tsx";
import { TemplatesTab } from "@/components/portfolio/sketch/left/TemplatesTab.tsx";
import type {
  CanvasElement,
  FrameElement,
  Portfolio,
  StampElement,
} from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios.ts";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore.ts";
import { useBuilderStore } from "@/store/useBuilderStore.ts";
import { render } from "@/test/render.tsx";

const PORTFOLIO_ID = "p-1";
const READY_TEMPLATES = /Ready-to-Use Templates \(6\)/;
const INSERT_PAGE = /Insert Page/;
const NAVIGATION_BAR = /Navigation Bar/;
const HERO_BIO = /Hero Bio/;

const basePortfolio = (elements: CanvasElement[]): Portfolio => ({
  id: PORTFOLIO_ID,
  title: "Portfolio",
  description: "",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  elements,
  moodboard: [],
  theme: { ...DEFAULT_THEMES[0] },
  generatedDesigns: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

const seed = (elements: CanvasElement[]) => {
  useSketchBuilderStore.setState({ draft: basePortfolio(elements) });
};

const draft = () => useSketchBuilderStore.getState().draft;

const frame = (
  overrides: Partial<FrameElement> & { id: string }
): FrameElement => ({
  type: "frame",
  title: overrides.id,
  route: "/",
  preset: "desktop",
  x: 0,
  y: 0,
  width: 1040,
  height: 760,
  zIndex: 1,
  ...overrides,
});

const stamp = (
  overrides: Partial<StampElement> & { id: string }
): StampElement => ({
  type: "stamp",
  stampType: "card",
  name: overrides.id,
  x: 0,
  y: 0,
  width: 200,
  height: 50,
  zIndex: 1,
  ...overrides,
});

const frameA = frame({ id: "frame-a", title: "Alpha", route: "/alpha" });
const frameB = frame({
  id: "frame-b",
  title: "Beta",
  route: "/beta",
  preset: "mobile",
  x: 1200,
  width: 375,
  height: 720,
  zIndex: 2,
  parentPageId: "frame-a",
});
const childLinked = stamp({
  id: "child-1",
  stampType: "navbar",
  name: "Linked Child",
  x: 40,
  y: 40,
  width: 900,
  height: 50,
  zIndex: 3,
  frameId: "frame-a",
});
const childGeo: CanvasElement = {
  id: "child-2",
  type: "text",
  name: "Geo Child",
  text: "hello",
  x: 100,
  y: 200,
  width: 200,
  height: 40,
  zIndex: 4,
};
const loose = stamp({
  id: "loose-1",
  stampType: "contact",
  name: "Loose Note",
  x: 5000,
  y: 5000,
  width: 200,
  height: 50,
  zIndex: 5,
});

const resetStores = () => {
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
};

beforeEach(resetStores);
afterEach(resetStores);

describe("getElementIcon", () => {
  const types = [
    "frame",
    "image",
    "pen",
    "rectangle",
    "ellipse",
    "line",
    "arrow",
    "text",
    "stamp",
  ] as CanvasElement["type"][];

  it.each(types)("returns an icon for a %s element", (type) => {
    const el = {
      id: "e",
      type,
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      zIndex: 1,
    } as unknown as CanvasElement;
    const icon = getElementIcon(el) as ReactElement;
    expect(icon).toBeTruthy();
    const { container } = render(icon);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("falls back to an icon for an unknown element type", () => {
    const el = {
      id: "e",
      type: "mystery",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      zIndex: 1,
    } as unknown as CanvasElement;
    const { container } = render(getElementIcon(el) as ReactElement);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("AddFramePresets", () => {
  const cases = [
    {
      preset: "desktop",
      name: "Desktop (1040)",
      width: 1040,
      title: "New Desktop Page",
      route: "/",
    },
    {
      preset: "mobile",
      name: "Mobile (375)",
      width: 375,
      title: "Mobile View",
      route: "/",
    },
    {
      preset: "tablet",
      name: "Tablet (768)",
      width: 768,
      title: "Tablet View",
      route: "/",
    },
    {
      preset: "card",
      name: "Modal / Card",
      width: 420,
      title: "Project Detail Modal",
      route: "/project-modal",
    },
  ];

  it.each(cases)(
    "adds a $preset frame when $name is clicked",
    async ({ name, width, title, route, preset }) => {
      seed([]);
      const { user } = render(<AddFramePresets />);

      await user.click(screen.getByRole("button", { name }));

      const frames = draft()?.elements.filter(
        (el) => el.type === "frame"
      ) as FrameElement[];
      expect(frames).toHaveLength(1);
      expect(frames[0]).toMatchObject({ preset, width, title, route });
      expect(useSketchBuilderStore.getState().selectedElementIds).toEqual([
        frames[0].id,
      ]);
    }
  );
});

describe("FrameTree", () => {
  it("lists frames with titles, routes and their contained children", () => {
    seed([frameA, frameB, childLinked, childGeo, loose]);
    render(<FrameTree />);

    expect(screen.getByText("Artboard Frames (2)")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("/alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("/beta")).toBeInTheDocument();
    expect(screen.getByText("Linked Child")).toBeInTheDocument();
    expect(screen.getByText("Geo Child")).toBeInTheDocument();
  });

  it("selects a frame when its row is clicked", async () => {
    seed([frameA, frameB]);
    const { user } = render(<FrameTree />);

    await user.click(screen.getByText("Alpha"));

    expect(useSketchBuilderStore.getState().selectedElementIds).toEqual([
      "frame-a",
    ]);
  });

  it("toggles a frame's visibility and lock in the store", async () => {
    seed([frameA]);
    const { user } = render(<FrameTree />);

    await user.click(screen.getByLabelText("Toggle Visibility"));
    const first = draft()?.elements ?? [];
    expect((first[0] as FrameElement).visible).toBe(false);

    await user.click(screen.getByLabelText("Toggle Lock"));
    const afterLock = draft()?.elements ?? [];
    expect((afterLock[0] as FrameElement).locked).toBe(true);
  });

  it("selects a child and deletes it", async () => {
    seed([frameA, childLinked]);
    const { user } = render(<FrameTree />);

    await user.click(screen.getByText("Linked Child"));
    expect(useSketchBuilderStore.getState().selectedElementIds).toEqual([
      "child-1",
    ]);

    await user.click(screen.getByRole("button", { name: "Delete Element" }));
    expect(draft()?.elements.some((el) => el.id === "child-1")).toBe(false);
  });

  it("centers the viewport on a frame on double click", async () => {
    seed([frameA]);
    const { user } = render(<FrameTree />);

    await user.dblClick(screen.getByText("Alpha"));

    expect(draft()?.viewport.x).not.toBe(0);
  });

  it("deletes a frame and its children after confirmation", async () => {
    seed([frameA, childLinked]);
    const { user } = render(<FrameTree />);

    await user.click(screen.getByLabelText("Delete Frame"));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    const ids = draft()?.elements.map((el) => el.id) ?? [];
    expect(ids).not.toContain("frame-a");
    expect(ids).not.toContain("child-1");
  });
});

describe("LooseElements", () => {
  it("renders only non-frame elements outside every frame", () => {
    seed([frameA, childLinked, loose]);
    render(<LooseElements />);

    expect(screen.getByText("Loose Canvas Elements (1)")).toBeInTheDocument();
    expect(screen.getByText("Loose Note")).toBeInTheDocument();
    expect(screen.queryByText("Linked Child")).not.toBeInTheDocument();
  });

  it("renders nothing when there are no loose elements", () => {
    seed([frameA, childLinked]);
    const { container } = render(<LooseElements />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("PagesTab", () => {
  it("shows presets, frame tree and loose elements sections", () => {
    seed([frameA, loose]);
    render(<PagesTab />);

    expect(screen.getByText("+ Add Artboard Frame")).toBeInTheDocument();
    expect(screen.getByText("Artboard Frames (1)")).toBeInTheDocument();
    expect(screen.getByText("Loose Canvas Elements (1)")).toBeInTheDocument();
  });
});

describe("SidebarTabs", () => {
  it("reports each tab selection to its handler", async () => {
    const onTabChange = vi.fn();
    const { user } = render(
      <SidebarTabs activeTab="pages" onTabChange={onTabChange} />
    );

    await user.click(screen.getByRole("button", { name: "Templates" }));
    expect(onTabChange).toHaveBeenCalledWith("templates");

    await user.click(screen.getByRole("button", { name: "Library" }));
    expect(onTabChange).toHaveBeenCalledWith("library");

    await user.click(screen.getByRole("button", { name: "Layers" }));
    expect(onTabChange).toHaveBeenCalledWith("pages");
  });
});

describe("LeftSidebar", () => {
  it("switches between the pages, templates and library panels", async () => {
    seed([]);
    const { user } = render(<LeftSidebar />);

    expect(screen.getByText("+ Add Artboard Frame")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Templates" }));
    expect(screen.getByText(READY_TEMPLATES)).toBeInTheDocument();
    expect(screen.queryByText("+ Add Artboard Frame")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Library" }));
    expect(screen.getByText("Click to Insert Component")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Layers" }));
    expect(screen.getByText("+ Add Artboard Frame")).toBeInTheDocument();
  });
});

describe("TemplatesTab", () => {
  it("inserts the first template page, sets its theme and switches to pages", async () => {
    seed([]);
    const onSwitchToPages = vi.fn();
    const { user } = render(<TemplatesTab onSwitchToPages={onSwitchToPages} />);

    await user.click(screen.getAllByRole("button", { name: INSERT_PAGE })[0]);

    const insertedFrame = draft()?.elements.find(
      (el) => el.type === "frame"
    ) as FrameElement;
    expect(insertedFrame).toBeTruthy();
    expect(insertedFrame.route).toBe("/design");
    expect(insertedFrame.title).toBe("Design Portfolio");
    expect(draft()?.theme.id).toBe("editorial-clean");
    expect(onSwitchToPages).toHaveBeenCalledTimes(1);
  });
});

describe("LibraryTab", () => {
  it("adds stamp elements for the clicked components", async () => {
    seed([]);
    const { user } = render(<LibraryTab />);

    await user.click(screen.getByRole("button", { name: NAVIGATION_BAR }));

    const first = draft()?.elements.find(
      (el) => el.type === "stamp"
    ) as StampElement;
    expect(first).toBeTruthy();
    expect(first.stampType).toBe("navbar");

    await user.click(screen.getByRole("button", { name: HERO_BIO }));

    expect(draft()?.elements.filter((el) => el.type === "stamp")).toHaveLength(
      2
    );
  });
});
