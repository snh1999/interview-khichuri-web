// @vitest-environment jsdom

import type { QueryClient } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/portfolio/builder/Sidebar";
import type { BuilderProject } from "@/components/portfolio/builder.types";
import { useAppStore } from "@/store/appStore";
import { createEmptyProject, useBuilderStore } from "@/store/useBuilderStore";
import { render } from "@/test/render";

const seedProject = (overrides: Partial<BuilderProject> = {}) => {
  useBuilderStore.setState({
    activePortfolioId: "p1",
    projects: { p1: { ...createEmptyProject(), ...overrides } },
  });
};

const withFiles = (files: Record<string, string>) =>
  seedProject({
    files,
    openFiles: Object.keys(files),
    activeFile: "/App.js",
  });

const FILES_1_RE = /Files \(1\)/;
const FILES_2_RE = /Files \(2\)/;
const FILES_4_RE = /Files \(4\)/;
const NEW_FILE_RE = /New File/;
const CONFIG_RE = /Project Setup & Config/;
const CARD_RE = /Card.jsx/;
const PROMPT_RE = /Ask AI to write code/;

const waitForApiKeys = async (queryClient: QueryClient) => {
  await waitFor(() =>
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .some((q) => q.queryKey[0] === "keys" && q.state.status === "success")
    ).toBe(true)
  );
};

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
  useAppStore.setState({ skipAiDialog: true });
  seedProject();
});

describe("Sidebar", () => {
  it("renders nothing when the sidebar is closed", () => {
    seedProject({ isSidebarOpen: false });
    const { container } = render(<Sidebar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists the project files on the Files tab", async () => {
    withFiles({ "/App.js": "app", "/Card.jsx": "card" });
    const { user } = render(<Sidebar />);

    await user.click(screen.getByRole("button", { name: FILES_2_RE }));

    expect(await screen.findByText("Project Explorer")).toBeInTheDocument();
    expect(screen.getByText("/App.js")).toBeInTheDocument();
    expect(screen.getByText("/Card.jsx")).toBeInTheDocument();
    expect(screen.getByText("2 files in project")).toBeInTheDocument();
  });

  it("creates a file, appending .jsx when no extension is given", async () => {
    const { user } = render(<Sidebar />);
    await user.click(screen.getByRole("button", { name: FILES_1_RE }));
    await user.click(screen.getByRole("button", { name: NEW_FILE_RE }));

    await user.type(
      screen.getByPlaceholderText("e.g. /components/Card.jsx"),
      "Hero"
    );
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(
      useBuilderStore.getState().projects.p1?.files["/Hero.jsx"]
    ).toBeDefined();
  });

  it("fills the filename from the quick extension buttons", async () => {
    const { user } = render(<Sidebar />);
    await user.click(screen.getByRole("button", { name: FILES_1_RE }));
    await user.click(screen.getByRole("button", { name: NEW_FILE_RE }));

    await user.click(screen.getByRole("button", { name: ".css" }));

    expect(
      screen.getByPlaceholderText("e.g. /components/Card.jsx")
    ).toHaveValue("Component.css");
  });

  it("duplicates, renames and opens files", async () => {
    withFiles({ "/App.js": "app", "/Card.jsx": "card" });
    const { user } = render(<Sidebar />);
    await user.click(screen.getByRole("button", { name: FILES_2_RE }));

    await user.click(screen.getByTitle("Rename file"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Panel.jsx{Enter}");
    await waitFor(() =>
      expect(
        useBuilderStore.getState().projects.p1?.files["/Panel.jsx"]
      ).toBeDefined()
    );

    await user.click(screen.getAllByTitle("Duplicate file")[1]);
    await waitFor(() =>
      expect(
        useBuilderStore.getState().projects.p1?.files["/Panel-copy.jsx"]
      ).toBeDefined()
    );

    await user.click(screen.getByRole("button", { name: "/Panel.jsx" }));
    expect(useBuilderStore.getState().projects.p1?.activeFile).toBe(
      "/Panel.jsx"
    );
  });

  it("deletes a file after confirming", async () => {
    withFiles({ "/App.js": "app", "/Card.jsx": "card" });
    const { user } = render(<Sidebar />);
    await user.click(screen.getByRole("button", { name: FILES_2_RE }));

    await user.click(screen.getByTitle("Delete file"));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(
        useBuilderStore.getState().projects.p1?.files["/Card.jsx"]
      ).toBeUndefined()
    );
  });

  it("reveals read-only config files behind the config section", async () => {
    withFiles({
      "/App.js": "app",
      "/package.json": "{}",
      "/vite.config.js": "cfg",
      "/index.html": "<html/>",
    });
    const { user } = render(<Sidebar />);
    await user.click(screen.getByRole("button", { name: FILES_4_RE }));

    await user.click(screen.getByRole("button", { name: CONFIG_RE }));

    expect(await screen.findByText("/package.json")).toBeInTheDocument();
    expect(screen.getAllByText("config").length).toBe(3);
  });

  it("renders chat history and opens a modified file", async () => {
    withFiles({ "/App.js": "app", "/Card.jsx": "card" });
    useBuilderStore.setState((state) => ({
      projects: {
        ...state.projects,
        p1: {
          ...(state.projects.p1 as BuilderProject),
          messages: [
            { id: "m1", sender: "user", content: "Hi", timestamp: "10:00" },
            {
              id: "m2",
              sender: "assistant",
              content: "Here you go",
              timestamp: "10:01",
              filesModified: ["/Card.jsx"],
            },
          ],
        },
      },
    }));
    const { user } = render(<Sidebar />);

    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.getByText("Here you go")).toBeInTheDocument();
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: CARD_RE }));
    expect(useBuilderStore.getState().projects.p1?.activeFile).toBe(
      "/Card.jsx"
    );
  });

  it("generates code from a quick prompt", async () => {
    const { user, queryClient } = render(<Sidebar />);
    await waitForApiKeys(queryClient);

    await user.click(screen.getByRole("button", { name: "Navbar Header" }));

    expect(await screen.findByText("Mocked builder reply")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create a responsive Navbar component and insert it at the top"
      )
    ).toBeInTheDocument();
  });

  it("generates code when Enter is pressed in the prompt", async () => {
    const { user, queryClient } = render(<Sidebar />);
    await waitForApiKeys(queryClient);

    const textarea = screen.getByPlaceholderText(PROMPT_RE);
    await user.type(textarea, "Add a footer{Enter}");

    expect(await screen.findByText("Mocked builder reply")).toBeInTheDocument();
  });
});
