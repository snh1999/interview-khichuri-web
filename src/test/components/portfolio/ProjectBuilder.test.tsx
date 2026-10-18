// @vitest-environment jsdom
/** biome-ignore-all lint/style/useNamingConvention: mocks third-party PascalCase exports */
import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectBuilder } from "@/components/portfolio/builder/ProjectBuilder";
import { createEmptyProject, useBuilderStore } from "@/store/useBuilderStore";
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
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
  useBuilderStore.setState({
    activePortfolioId: "p1",
    projects: { p1: createEmptyProject() },
  });
});

describe("ProjectBuilder", () => {
  it("composes the sidebar and workspace", () => {
    render(<ProjectBuilder />);

    expect(screen.getByText("AI Chat")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Navbar Header" })
    ).toBeInTheDocument();
  });
});
