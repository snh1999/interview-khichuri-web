// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildNewPortfolio } from "@/components/portfolio/portfolio.helpers";
import { SketchNavbar } from "@/components/portfolio/sketch/SketchNavbar";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import { createEmptyProject, useBuilderStore } from "@/store/useBuilderStore";
import { render } from "@/test/render";

const portfolio = () => ({
  ...buildNewPortfolio({ title: "Alpha" }),
  id: "p1",
});

const ALPHA_RE = /Alpha/;
const CODE_BUILDER_RE = /Code Builder/;

beforeEach(() => {
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
  useSketchBuilderStore.setState({ draft: portfolio() });
  useBuilderStore.setState({
    activePortfolioId: "p1",
    projects: { p1: createEmptyProject() },
  });
});

describe("SketchNavbar", () => {
  it("renders the portfolio title, initials and canvas controls", () => {
    render(<SketchNavbar />);

    expect(screen.getByRole("button", { name: ALPHA_RE })).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Portfolio" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Page" })
    ).toBeInTheDocument();
  });

  it("renames the portfolio from the title", async () => {
    const { user } = render(<SketchNavbar />);

    await user.click(screen.getByRole("button", { name: ALPHA_RE }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Beta{Enter}");

    await waitFor(() =>
      expect(useSketchBuilderStore.getState().draft?.title).toBe("Beta")
    );
  });

  it("keeps the title when the rename input is emptied", async () => {
    const { user } = render(<SketchNavbar />);

    await user.click(screen.getByRole("button", { name: ALPHA_RE }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "{Enter}");

    await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
    expect(useSketchBuilderStore.getState().draft?.title).toBe("Alpha");
  });

  it("defaults the title initials when the title is blank", () => {
    useSketchBuilderStore.setState({
      draft: { ...portfolio(), title: "   " },
    });
    render(<SketchNavbar />);
    expect(screen.getByText("IK")).toBeInTheDocument();
  });

  it("toggles the sketch sidebar", async () => {
    const { user } = render(<SketchNavbar />);

    await user.click(screen.getByRole("button", { name: "Hide sidebar" }));
    expect(useSketchBuilderStore.getState().isSidebarOpen).toBe(false);
  });

  it("resets the zoom from the percentage control", async () => {
    useSketchBuilderStore.setState({
      draft: { ...portfolio(), viewport: { x: 10, y: 10, zoom: 1.5 } },
    });
    const { user } = render(<SketchNavbar />);

    expect(screen.getByTitle("Reset Zoom")).toHaveTextContent("150%");
    await user.click(screen.getByTitle("Reset Zoom"));
    expect(useSketchBuilderStore.getState().draft?.viewport).toEqual({
      x: 0,
      y: 0,
      zoom: 1,
    });
  });

  it("exports the portfolio schema as a JSON download", async () => {
    const createObjectURL = vi.fn(() => "blob:schema");
    const revokeObjectURL = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    const { user } = render(<SketchNavbar />);
    await user.click(screen.getByRole("button", { name: "Export" }));

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledOnce();
    click.mockRestore();
  });

  it("switches to the code builder tab and changes device mode", async () => {
    const { user } = render(<SketchNavbar />);

    await user.click(screen.getByRole("tab", { name: CODE_BUILDER_RE }));
    expect(useSketchBuilderStore.getState().viewMode).toBe("preview");

    await user.click(screen.getByTitle("Mobile View (375px)"));
    expect(useBuilderStore.getState().projects.p1?.deviceMode).toBe("mobile");

    await user.click(screen.getByTitle("Tablet View (768px)"));
    expect(useBuilderStore.getState().projects.p1?.deviceMode).toBe("tablet");
  });

  it("opens the AI modal directly when the project has no files", async () => {
    const { user } = render(<SketchNavbar />);

    await user.click(
      screen.getByRole("button", { name: "Generate Portfolio" })
    );
    expect(useSketchBuilderStore.getState().isAiModalOpen).toBe(true);
    expect(useSketchBuilderStore.getState().aiModalMode).toBe("new");
  });

  it("confirms before replacing a project that already has files", async () => {
    useBuilderStore.setState({
      projects: {
        p1: { ...createEmptyProject(), files: { "/App.js": "code" } },
      },
    });
    const { user } = render(<SketchNavbar />);

    await user.click(
      screen.getByRole("button", { name: "Generate Portfolio" })
    );
    expect(
      await screen.findByText("Replace your current project?")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Replace" }));
    expect(useSketchBuilderStore.getState().isAiModalOpen).toBe(true);
  });

  it("appends a page in append mode", async () => {
    const { user } = render(<SketchNavbar />);

    await user.click(screen.getByRole("button", { name: "Add Page" }));
    expect(useSketchBuilderStore.getState().aiModalMode).toBe("append");
    expect(useSketchBuilderStore.getState().isAiModalOpen).toBe(true);
  });
});
