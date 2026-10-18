import { fireEvent, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CanvasPageBanner } from "@/components/portfolio/sketch/CanvasPageBanner.tsx";
import type {
  FrameElement,
  Portfolio,
} from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios.ts";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore.ts";
import { render } from "@/test/render.tsx";

const PORTFOLIO = "p-1";
const PAGE_SETUP = /page setup/i;
const SAVE_CLOSE = /save & close/i;
const ATTACH_INSPIRATION = /attach inspiration/i;
const IDB_URL = /^idb:\/\//;

const frame = (
  overrides: Partial<FrameElement> & { id: string }
): FrameElement => ({
  type: "frame",
  title: overrides.id,
  route: `/${overrides.id}`,
  preset: "desktop",
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  zIndex: 1,
  ...overrides,
});

const seed = (elements: FrameElement[]) => {
  const portfolio: Portfolio = {
    id: PORTFOLIO,
    title: "P",
    description: "",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    elements,
    moodboard: [],
    theme: { ...DEFAULT_THEMES[0] },
    generatedDesigns: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
  useSketchBuilderStore.setState({
    draft: portfolio,
    viewMode: "canvas",
  });
};

afterEach(() => {
  useSketchBuilderStore.setState({
    draft: null,
    viewMode: "canvas",
  });
  vi.restoreAllMocks();
});

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
});

const savedFrame = (id: string): FrameElement | undefined =>
  useSketchBuilderStore.getState().draft?.elements.find((el) => el.id === id) as
    | FrameElement
    | undefined;

describe("CanvasPageBanner", () => {
  it("keeps each frame's field ids unique so labels resolve to their own input", async () => {
    const alpha = frame({ id: "a", title: "Alpha" });
    const beta = frame({ id: "b", title: "Beta" });
    seed([alpha, beta]);

    const { user } = render(
      <>
        <CanvasPageBanner frame={alpha} />
        <CanvasPageBanner frame={beta} />
      </>
    );
    const setupButtons = screen.getAllByRole("button", {
      name: PAGE_SETUP,
    });
    await user.click(setupButtons[0]);
    await user.click(setupButtons[1]);

    const titleInputs = screen.getAllByLabelText(
      "Page Title"
    ) as HTMLInputElement[];
    expect(titleInputs.map((input) => input.value).sort()).toEqual([
      "Alpha",
      "Beta",
    ]);
  });

  it("omits descendant frames so a parent cycle cannot be created", async () => {
    const alpha = frame({ id: "a", title: "Alpha" });
    const beta = frame({ id: "b", title: "Beta", parentPageId: "a" });
    const gamma = frame({ id: "c", title: "Gamma", parentPageId: "b" });
    const delta = frame({ id: "d", title: "Delta" });
    seed([alpha, beta, gamma, delta]);

    const { user } = render(<CanvasPageBanner frame={alpha} />);
    await user.click(screen.getByRole("button", { name: PAGE_SETUP }));
    await user.click(await screen.findByRole("combobox"));

    expect(screen.getByText("Delta (/d)")).toBeInTheDocument();
    expect(screen.queryByText("Beta (/b)")).not.toBeInTheDocument();
    expect(screen.queryByText("Gamma (/c)")).not.toBeInTheDocument();
  });

  it("shows the parent page title in the closed select, not its id", async () => {
    const alpha = frame({ id: "a", title: "Alpha" });
    const beta = frame({ id: "b", title: "Beta", parentPageId: "a" });
    seed([alpha, beta]);

    const { user } = render(<CanvasPageBanner frame={beta} />);
    await user.click(screen.getByRole("button", { name: PAGE_SETUP }));

    expect(screen.getByRole("combobox")).toHaveTextContent("Alpha (/a)");
  });

  it("selects the frame when the collapsed banner is clicked", async () => {
    const alpha = frame({ id: "a", title: "Alpha" });
    seed([alpha]);

    const { user } = render(<CanvasPageBanner frame={alpha} />);
    await user.click(screen.getByText("Alpha"));

    expect(useSketchBuilderStore.getState().selectedElementIds).toEqual(["a"]);
  });

  it("saves the edited title, route and goal and closes the form", async () => {
    const alpha = frame({ id: "a", title: "Alpha", route: "/a" });
    seed([alpha]);

    const { user } = render(<CanvasPageBanner frame={alpha} />);
    await user.click(screen.getByRole("button", { name: PAGE_SETUP }));

    const title = screen.getByLabelText("Page Title");
    await user.clear(title);
    await user.type(title, "Beta");

    const route = screen.getByLabelText("Route Path");
    await user.clear(route);
    await user.type(route, "/beta");

    await user.type(
      screen.getByLabelText("Page Goal / Vibe Hint"),
      "Show metrics"
    );
    await user.click(screen.getByRole("button", { name: SAVE_CLOSE }));

    expect(savedFrame("a")?.title).toBe("Beta");
    expect(savedFrame("a")?.route).toBe("/beta");
    expect(savedFrame("a")?.description).toBe("Show metrics");
    expect(
      screen.queryByRole("button", { name: SAVE_CLOSE })
    ).not.toBeInTheDocument();
  });

  it("saves a chosen parent page", async () => {
    const alpha = frame({ id: "a", title: "Alpha" });
    const beta = frame({ id: "b", title: "Beta" });
    seed([alpha, beta]);

    const { user } = render(<CanvasPageBanner frame={beta} />);
    await user.click(screen.getByRole("button", { name: PAGE_SETUP }));
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Alpha (/a)"));
    await user.click(screen.getByRole("button", { name: SAVE_CLOSE }));

    expect(savedFrame("b")?.parentPageId).toBe("a");
  });

  it("marks a home frame with its Home badge", async () => {
    const home = frame({ id: "a", title: "Home", isHome: true });
    seed([home]);

    const { user } = render(<CanvasPageBanner frame={home} />);
    await user.click(screen.getByRole("button", { name: PAGE_SETUP }));

    expect(screen.getByText("Home (/)")).toBeInTheDocument();
  });

  it("deletes the frame after confirming the dialog", async () => {
    const alpha = frame({ id: "a", title: "Alpha" });
    seed([alpha]);

    const { user } = render(<CanvasPageBanner frame={alpha} />);
    await user.click(screen.getByRole("button", { name: "Delete Page Frame" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(useSketchBuilderStore.getState().draft?.elements).toHaveLength(0);
    });
  });

  it("rejects a non-image inspiration file", async () => {
    const errorSpy = vi.spyOn(toast, "error");
    const alpha = frame({ id: "a", title: "Alpha" });
    seed([alpha]);

    const { user } = render(<CanvasPageBanner frame={alpha} />);
    await user.click(screen.getByRole("button", { name: PAGE_SETUP }));
    const input = screen.getByLabelText(ATTACH_INSPIRATION);
    Object.defineProperty(input, "files", {
      value: [new File(["x"], "notes.txt", { type: "text/plain" })],
    });
    fireEvent.change(input);

    expect(errorSpy).toHaveBeenCalledWith("Only image files are allowed");
  });

  it("rejects an inspiration image larger than 5MB", async () => {
    const errorSpy = vi.spyOn(toast, "error");
    const alpha = frame({ id: "a", title: "Alpha" });
    seed([alpha]);

    const { user } = render(<CanvasPageBanner frame={alpha} />);
    await user.click(screen.getByRole("button", { name: PAGE_SETUP }));
    const input = screen.getByLabelText(ATTACH_INSPIRATION);
    const big = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: 6 * 1024 * 1024 });
    await user.upload(input, big);

    expect(errorSpy).toHaveBeenCalledWith("Image must be smaller than 5MB");
  });

  it("persists an attached inspiration image to local storage", async () => {
    const alpha = frame({ id: "a", title: "Alpha" });
    seed([alpha]);

    const { user } = render(<CanvasPageBanner frame={alpha} />);
    await user.click(screen.getByRole("button", { name: PAGE_SETUP }));
    const input = screen.getByLabelText(ATTACH_INSPIRATION);
    await user.upload(
      input,
      new File(["hello"], "mood.png", { type: "image/png" })
    );

    await waitFor(() => {
      expect(savedFrame("a")?.inspirationImageUrl).toMatch(IDB_URL);
    });
  });

  it("renders an http inspiration image and removes it", async () => {
    const alpha = frame({
      id: "a",
      title: "Alpha",
      inspirationImageUrl: "https://example.com/mood.png",
    });
    seed([alpha]);

    const { user } = render(<CanvasPageBanner frame={alpha} />);

    expect(await screen.findByAltText("Moodboard")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: PAGE_SETUP }));
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(savedFrame("a")?.inspirationImageUrl).toBeUndefined();
  });
});
