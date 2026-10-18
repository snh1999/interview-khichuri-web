// @vitest-environment jsdom
/** biome-ignore-all lint/style/useNamingConvention: mocks third-party PascalCase exports */
import { act, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Workspace } from "@/components/portfolio/builder/Workspace";
import { createEmptyProject, useBuilderStore } from "@/store/useBuilderStore";
import { render } from "@/test/render";

const sandpackFiles = vi.hoisted(() => ({
  current: {} as Record<string, { code: string }>,
}));

vi.mock("@codesandbox/sandpack-react", () => ({
  SandpackCodeEditor: () => null,
  SandpackLayout: (props: { children?: ReactNode }) => props.children,
  SandpackPreview: () => null,
  SandpackProvider: (props: { children?: ReactNode }) => props.children,
  useSandpack: () => ({ sandpack: { files: sandpackFiles.current } }),
}));

const seed = (overrides: Partial<ReturnType<typeof createEmptyProject>>) => {
  const project = { ...createEmptyProject(), ...overrides };
  useBuilderStore.setState({
    activePortfolioId: "p1",
    projects: { p1: project },
  });
};

beforeEach(() => {
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
  sandpackFiles.current = {};
  vi.useRealTimers();
});

describe("Workspace", () => {
  it("hides the editor tabs in preview mode", () => {
    seed({ viewMode: "preview" });
    render(<Workspace />);
    expect(screen.queryByRole("button", { name: "App.js" })).toBeNull();
  });

  it("shows open files as tabs in code mode and opens on click", async () => {
    seed({
      viewMode: "code",
      files: { "/App.js": "app", "/Card.jsx": "card" },
      openFiles: ["/App.js", "/Card.jsx"],
      activeFile: "/App.js",
    });
    const { user } = render(<Workspace />);

    expect(screen.getByRole("button", { name: "App.js" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Card.jsx" }));
    expect(useBuilderStore.getState().projects.p1?.activeFile).toBe(
      "/Card.jsx"
    );
  });

  it("flags config files as read-only tabs", () => {
    seed({
      viewMode: "code",
      files: { "/App.js": "app", "/package.json": "{}" },
      openFiles: ["/App.js", "/package.json"],
      activeFile: "/App.js",
    });
    render(<Workspace />);

    expect(
      screen.getByTitle("Read-only project configuration")
    ).toBeInTheDocument();
  });

  it("shows the read-only banner when a config file is active", () => {
    seed({
      viewMode: "code",
      files: { "/App.js": "app", "/package.json": "{}" },
      openFiles: ["/App.js", "/package.json"],
      activeFile: "/package.json",
    });
    render(<Workspace />);

    expect(
      screen.getByText("Project system configuration (read-only reference)")
    ).toBeInTheDocument();
  });

  it("does not flag source files as read-only", () => {
    seed({
      viewMode: "code",
      files: { "/App.js": "app" },
      openFiles: ["/App.js"],
      activeFile: "/App.js",
    });
    render(<Workspace />);

    expect(screen.queryByTitle("Read-only project configuration")).toBeNull();
  });

  it("flushes a pending sandbox edit when the workspace unmounts", () => {
    seed({
      viewMode: "code",
      files: { "/App.js": "old" },
      openFiles: ["/App.js"],
      activeFile: "/App.js",
    });
    sandpackFiles.current = { "/App.js": { code: "typed" } };

    const { unmount } = render(<Workspace />);
    unmount();

    expect(useBuilderStore.getState().projects.p1.files["/App.js"]).toBe(
      "typed"
    );
  });

  it("flushes a pending sandbox edit after switching the active file", () => {
    vi.useFakeTimers();
    try {
      seed({
        viewMode: "code",
        files: { "/App.js": "old", "/Card.jsx": "card" },
        openFiles: ["/App.js", "/Card.jsx"],
        activeFile: "/App.js",
      });
      sandpackFiles.current = { "/App.js": { code: "typed" } };

      render(<Workspace />);
      act(() => {
        useBuilderStore.getState().setActiveFile("/Card.jsx");
      });
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(useBuilderStore.getState().projects.p1.files["/App.js"]).toBe(
        "typed"
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
