// @vitest-environment jsdom
/** biome-ignore-all lint/style/useNamingConvention: mocks third-party PascalCase exports */
import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildNewPortfolio } from "@/components/portfolio/portfolio.helpers";
import { PortfolioSketchPage } from "@/pages/PortfolioSketchPage";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import { useBuilderStore } from "@/store/useBuilderStore";
import { render } from "@/test/render";

vi.mock("@codesandbox/sandpack-react", () => ({
  SandpackCodeEditor: () => null,
  SandpackLayout: (props: { children?: ReactNode }) => props.children,
  SandpackPreview: () => null,
  SandpackProvider: (props: { children?: ReactNode }) => props.children,
  useSandpack: () => ({ sandpack: { files: {} } }),
}));

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
  useSketchBuilderStore.setState({
    draft: { ...buildNewPortfolio({ title: "Alpha" }), id: "p1" },
  });
});

describe("PortfolioSketchPage", () => {
  it("shows the canvas placeholder in canvas mode", () => {
    render(<PortfolioSketchPage />);

    expect(
      screen.getByText("Canvas will be added in the next PR.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Portfolio" })
    ).toBeInTheDocument();
  });

  it("lazily loads the project builder in preview mode", async () => {
    useSketchBuilderStore.setState({ viewMode: "preview" });
    render(<PortfolioSketchPage />);

    expect(await screen.findByText("AI Chat")).toBeInTheDocument();
    expect(useBuilderStore.getState().activePortfolioId).toBe("p1");
  });
});
