// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BuilderProject } from "@/components/portfolio/builder.types";
import type { Portfolio } from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios.ts";
import { setActiveUserId } from "@/lib/storage/portfolioDb";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore.ts";
import {
  createEmptyProject,
  EMPTY_PROJECT,
  getActiveProject,
  projectHasFiles,
  useBuilderStore,
} from "@/store/useBuilderStore.ts";

const PORTFOLIO = "p1";

const MESSAGE_ID_RE = /^msg/;

const project = (): BuilderProject =>
  useBuilderStore.getState().projects[PORTFOLIO];

const seedProject = (overrides?: Partial<BuilderProject>) => {
  useBuilderStore.setState({
    activePortfolioId: PORTFOLIO,
    projects: { [PORTFOLIO]: { ...createEmptyProject(), ...overrides } },
  });
};

const seedDraft = () => {
  const draft: Portfolio = {
    id: PORTFOLIO,
    title: "P",
    description: "",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    elements: [],
    moodboard: [],
    theme: { ...DEFAULT_THEMES[0] },
    generatedDesigns: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
  useSketchBuilderStore.setState({ draft });
};

beforeEach(() => {
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
  useSketchBuilderStore.setState({ draft: null });
  setActiveUserId(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  setActiveUserId(undefined);
});

describe("useBuilderStore helpers", () => {
  it("getActiveProject falls back to the shared empty stub", () => {
    expect(getActiveProject(useBuilderStore.getState())).toBe(EMPTY_PROJECT);

    useBuilderStore.setState({ activePortfolioId: "ghost" });
    expect(getActiveProject(useBuilderStore.getState())).toBe(EMPTY_PROJECT);
  });

  it("projectHasFiles is false for a stub and true once files change", () => {
    const fresh = createEmptyProject();
    expect(projectHasFiles(fresh)).toBe(false);
    expect(
      projectHasFiles({ ...fresh, files: { "/App.js": "x", "/s.css": "" } })
    ).toBe(true);
    expect(projectHasFiles({ ...fresh, files: { "/App.js": "custom" } })).toBe(
      true
    );
  });
});

describe("useBuilderStore project lifecycle", () => {
  it("sets the active portfolio", () => {
    useBuilderStore.getState().setActivePortfolio("x");
    expect(useBuilderStore.getState().activePortfolioId).toBe("x");

    useBuilderStore.getState().setActivePortfolio(null);
    expect(useBuilderStore.getState().activePortfolioId).toBeNull();
  });

  it("ensures a blank project once and leaves an existing one untouched", () => {
    useBuilderStore.getState().ensureProject("new");
    expect(useBuilderStore.getState().projects.new).toBeDefined();

    const before = useBuilderStore.getState().projects.new;
    useBuilderStore.getState().ensureProject("new");
    expect(useBuilderStore.getState().projects.new).toBe(before);
  });

  it("seeds generated files and picks the entry point as active", () => {
    useBuilderStore.getState().seedGeneratedFiles(PORTFOLIO, {
      "/App.js": "// generated",
      "/styles.css": "",
    });

    expect(useBuilderStore.getState().activePortfolioId).toBe(PORTFOLIO);
    expect(project().activeFile).toBe("/App.js");
    expect(project().openFiles).toEqual(["/App.js", "/styles.css"]);
  });

  it("falls back to the first path when the map has no /App.js", () => {
    useBuilderStore.getState().seedGeneratedFiles(PORTFOLIO, {
      "/main.js": "m",
    });

    expect(project().activeFile).toBe("/main.js");
  });

  it("replaces files but only carries over still-existing tabs", () => {
    seedProject({ files: { "/App.js": "old", "/Old.jsx": "old" } });

    useBuilderStore.getState().seedGeneratedFiles(PORTFOLIO, {
      "/App.js": "new",
    });

    expect(project().files).toEqual({ "/App.js": "new" });
    expect(project().openFiles).toEqual(["/App.js"]);
  });

  it("clones files but not the chat transcript", () => {
    seedProject({ files: { "/App.js": "code" } });
    useBuilderStore.getState().addMessage({ sender: "user", content: "hi" });

    useBuilderStore.getState().cloneProject(PORTFOLIO, "p2");

    const copy = useBuilderStore.getState().projects.p2;
    expect(copy.files).toEqual({ "/App.js": "code" });
    expect(copy.messages).toEqual([]);
  });

  it("does nothing when cloning a portfolio with no project", () => {
    useBuilderStore.getState().cloneProject("missing", "p2");
    expect(useBuilderStore.getState().projects.p2).toBeUndefined();
  });

  it("drops a project, clearing it as active only when it matches", () => {
    seedProject();
    useBuilderStore.setState({ activePortfolioId: "other" });
    useBuilderStore.getState().dropProject(PORTFOLIO);
    expect(useBuilderStore.getState().projects[PORTFOLIO]).toBeUndefined();
    expect(useBuilderStore.getState().activePortfolioId).toBe("other");

    seedProject();
    useBuilderStore.getState().dropProject(PORTFOLIO);
    expect(useBuilderStore.getState().activePortfolioId).toBeNull();

    useBuilderStore.getState().dropProject("never-existed");
  });

  it("resets the active project to a blank stub", () => {
    seedProject({ files: { "/App.js": "x", "/A.js": "a" } });

    useBuilderStore.getState().resetToDemo();

    expect(project().files).toEqual({ "/App.js": expect.any(String) });
    expect(Object.keys(project().files)).toHaveLength(1);

    useBuilderStore.setState({ activePortfolioId: null });
    useBuilderStore.getState().resetToDemo();
  });

  it("ignores per-project patches without an active portfolio", () => {
    useBuilderStore.getState().setViewMode("code");
    useBuilderStore.getState().setDeviceMode("mobile");
    useBuilderStore.getState().setSidebarTab("files");
    useBuilderStore.getState().setCodePaneOpen(true);
    useBuilderStore.getState().toggleSidebar();
    useBuilderStore.getState().setActiveFile("/X.js");
    useBuilderStore.getState().openFile("/X.js");
    useBuilderStore.getState().closeFile("/X.js");
    useBuilderStore.getState().updateFileContent("/X.js", "x");

    expect(useBuilderStore.getState().projects).toEqual({});
  });
});

describe("useBuilderStore view state", () => {
  beforeEach(() => seedProject());

  it("updates mode, device, and sidebar tab", () => {
    useBuilderStore.getState().setViewMode("code");
    useBuilderStore.getState().setDeviceMode("tablet");
    useBuilderStore.getState().setSidebarTab("files");

    expect(project().viewMode).toBe("code");
    expect(project().deviceMode).toBe("tablet");
    expect(project().sidebarTab).toBe("files");
  });

  it("drives view mode from the code pane", () => {
    useBuilderStore.getState().setCodePaneOpen(true);
    expect(project().isCodePaneOpen).toBe(true);
    expect(project().viewMode).toBe("split");

    useBuilderStore.getState().setCodePaneOpen(false);
    expect(project().viewMode).toBe("preview");
  });

  it("toggles the sidebar", () => {
    const before = project().isSidebarOpen;
    useBuilderStore.getState().toggleSidebar();
    expect(project().isSidebarOpen).toBe(!before);
  });

  it("sets the active file, ignoring invalid values", () => {
    useBuilderStore.getState().setActiveFile("/Hero.jsx");
    expect(project().activeFile).toBe("/Hero.jsx");

    useBuilderStore.getState().setActiveFile("");
    expect(project().activeFile).toBe("/Hero.jsx");
  });

  it("opens a file once, revealing the code pane", () => {
    useBuilderStore.getState().openFile("/Hero.jsx");
    useBuilderStore.getState().openFile("/Hero.jsx");

    expect(project().activeFile).toBe("/Hero.jsx");
    expect(project().openFiles.filter((f) => f === "/Hero.jsx")).toHaveLength(
      1
    );
    expect(project().isCodePaneOpen).toBe(true);

    useBuilderStore.getState().openFile("");
    expect(project().activeFile).toBe("/Hero.jsx");
  });

  it("closes a file, moving the selection and collapsing an empty pane", () => {
    useBuilderStore.getState().openFile("/Hero.jsx");
    useBuilderStore.getState().closeFile("/Hero.jsx");

    expect(project().openFiles).toEqual(["/App.js"]);
    expect(project().activeFile).toBe("/App.js");
    expect(project().isCodePaneOpen).toBe(true);

    useBuilderStore.getState().closeFile("/App.js");
    expect(project().openFiles).toEqual([]);
    expect(project().isCodePaneOpen).toBe(false);
    expect(project().viewMode).toBe("preview");
  });

  it("updates file content, ignoring invalid paths", () => {
    useBuilderStore.getState().updateFileContent("/App.js", "next");
    expect(project().files["/App.js"]).toBe("next");

    useBuilderStore.getState().updateFileContent("", "nope");
    expect(project().files[""]).toBeUndefined();
  });
});

describe("useBuilderStore file operations", () => {
  beforeEach(() => seedProject());

  it("creates a file with path normalization and a chosen template", () => {
    useBuilderStore.getState().createFile("Hero.jsx");
    expect(project().files["/Hero.jsx"]).toContain(
      "export default function Hero"
    );
    expect(project().activeFile).toBe("/Hero.jsx");

    useBuilderStore.getState().createFile("/Card.js");
    expect(project().files["/Card.js"]).toContain(
      "export default function Card"
    );

    useBuilderStore.getState().createFile("/utils.js");
    expect(project().files["/utils.js"]).toContain(
      "export default function Utils"
    );

    useBuilderStore.getState().createFile("/theme.css");
    expect(project().files["/theme.css"]).toContain(".custom-card");

    useBuilderStore.getState().createFile("/data.json");
    expect(project().files["/data.json"]).toContain('"title": "Custom Data"');

    useBuilderStore.getState().createFile("/snippet.html");
    expect(project().files["/snippet.html"]).toContain("Custom HTML Snippet");

    useBuilderStore.getState().createFile("/notes.txt");
    expect(project().files["/notes.txt"]).toContain("// File: /notes.txt");

    useBuilderStore.getState().createFile("/explicit.js", "// given");
    expect(project().files["/explicit.js"]).toBe("// given");
  });

  it("rejects invalid, duplicate, or project-less creates", () => {
    expect(useBuilderStore.getState().createFile("   ")).toBe(false);
    expect(useBuilderStore.getState().createFile("/App.js")).toBe(false);

    useBuilderStore.setState({ activePortfolioId: null });
    expect(useBuilderStore.getState().createFile("/New.js")).toBe(false);
  });

  it("deletes eligible files and reassigns the active tab", () => {
    useBuilderStore.getState().createFile("/Hero.jsx");
    useBuilderStore.getState().deleteFile("/Hero.jsx");

    expect(project().files["/Hero.jsx"]).toBeUndefined();
    expect(project().activeFile).toBe("/App.js");

    useBuilderStore.getState().deleteFile("/App.js");
    useBuilderStore.getState().deleteFile("/public/index.html");
    useBuilderStore.getState().deleteFile("/missing.js");
    useBuilderStore.getState().deleteFile("");
    expect(project().files["/App.js"]).toBeDefined();
  });

  it("renames a file, keeping tabs and active selection in step", () => {
    useBuilderStore.getState().openFile("/App.js");
    useBuilderStore.getState().createFile("/Hero.jsx");

    expect(useBuilderStore.getState().renameFile("/Hero.jsx", "Card.jsx")).toBe(
      true
    );
    expect(project().files["/Card.jsx"]).toBeDefined();
    expect(project().files["/Hero.jsx"]).toBeUndefined();

    useBuilderStore.getState().setActiveFile("/Card.jsx");
    useBuilderStore.getState().renameFile("/Card.jsx", "/Renamed.jsx");
    expect(project().activeFile).toBe("/Renamed.jsx");
  });

  it("rejects invalid renames", () => {
    useBuilderStore.getState().createFile("/Hero.jsx");
    useBuilderStore.getState().createFile("/Other.jsx");

    expect(useBuilderStore.getState().renameFile("", "x")).toBe(false);
    expect(
      useBuilderStore.getState().renameFile("/Hero.jsx", "/Hero.jsx")
    ).toBe(false);
    expect(useBuilderStore.getState().renameFile("/App.js", "/Main.js")).toBe(
      false
    );
    expect(
      useBuilderStore.getState().renameFile("/Hero.jsx", "/Other.jsx")
    ).toBe(false);
    expect(
      useBuilderStore.getState().renameFile("/missing.jsx", "/x.jsx")
    ).toBe(false);
  });

  it("duplicates a file with incrementing suffixes", () => {
    useBuilderStore.getState().updateFileContent("/App.js", "code");
    useBuilderStore.getState().duplicateFile("/App.js");
    useBuilderStore.getState().duplicateFile("/App.js");
    useBuilderStore.getState().duplicateFile("/App.js");

    expect(project().files["/App-copy.js"]).toBe("code");
    expect(project().files["/App-copy2.js"]).toBe("code");
    expect(project().files["/App-copy3.js"]).toBe("code");

    useBuilderStore.getState().duplicateFile("/missing.js");
    expect(project().files["/missing-copy.js"]).toBeUndefined();
  });

  it("ignores rename when there is no active portfolio", () => {
    useBuilderStore.getState().createFile("/Hero.jsx");
    useBuilderStore.setState({ activePortfolioId: null });
    expect(useBuilderStore.getState().renameFile("/Hero.jsx", "/X.jsx")).toBe(
      false
    );
  });
});

describe("useBuilderStore messages & AI results", () => {
  it("adds a chat message", () => {
    seedProject();
    useBuilderStore.getState().addMessage({ sender: "user", content: "hi" });

    const message = project().messages.at(-1);
    expect(message?.content).toBe("hi");
    expect(message?.id).toMatch(MESSAGE_ID_RE);
  });

  it("adds no message without an active portfolio", () => {
    useBuilderStore.getState().addMessage({ sender: "user", content: "hi" });
    expect(useBuilderStore.getState().projects).toEqual({});
  });
});

describe("useBuilderStore.applyAiResult", () => {
  it("removes a file the server deleted", () => {
    seedProject({ files: { "/App.js": "old", "/Old.jsx": "obsolete" } });

    useBuilderStore.getState().applyAiResult({
      files: { "/App.js": "new", "/Hero.jsx": "hero" },
      message: "done",
      applied: ["updated /App.js", "created /Hero.jsx", "deleted /Old.jsx"],
    });

    expect(project().files).toEqual({
      "/App.js": "new",
      "/Hero.jsx": "hero",
    });
  });

  it("keeps files the server did not touch, including local edits", () => {
    seedProject({
      files: { "/App.js": "old", "/Local.jsx": "edited while the AI ran" },
    });

    useBuilderStore.getState().applyAiResult({
      files: { "/App.js": "new" },
      message: "done",
      applied: ["updated /App.js"],
    });

    expect(project().files["/Local.jsx"]).toBe("edited while the AI ran");
  });

  it("lists each changed file once and excludes deletes", () => {
    seedProject();

    useBuilderStore.getState().applyAiResult({
      files: { "/Hero.jsx": "hero" },
      message: "done",
      applied: [
        "created /Hero.jsx",
        "updated /Hero.jsx",
        "deleted /Old.jsx",
        "not a valid entry",
      ],
    });

    const assistant = project().messages.at(-1);
    expect(assistant?.filesModified).toEqual(["/Hero.jsx"]);
    expect(assistant?.content).toBe("done");
  });

  it("activates the first changed file and opens it", () => {
    seedProject({ activeFile: "/App.js", openFiles: ["/App.js"] });

    useBuilderStore.getState().applyAiResult({
      files: { "/App.js": "new", "/Hero.jsx": "hero" },
      message: "done",
      applied: ["updated /App.js", "created /Hero.jsx"],
    });

    expect(project().activeFile).toBe("/App.js");
    expect(project().openFiles).toContain("/Hero.jsx");
    expect(project().viewMode).toBe("split");
  });

  it("does not move the active file when no file was created or updated", () => {
    seedProject({ activeFile: "/App.js", openFiles: ["/App.js"] });

    useBuilderStore.getState().applyAiResult({
      files: { "/App.js": "new" },
      message: "removed a component",
      applied: ["deleted /Old.jsx"],
    });

    expect(project().activeFile).toBe("/App.js");
    expect(project().messages.at(-1)?.filesModified).toEqual([]);
  });

  it("appends generated files through the merge path", () => {
    seedProject({ files: { "/App.js": "old", "/Home.js": "home" } });

    useBuilderStore
      .getState()
      .appendGeneratedFiles(
        { "/App.js": "new-router", "/Contact.js": "contact" },
        "Added /contact"
      );

    expect(project().files).toEqual({
      "/App.js": "new-router",
      "/Home.js": "home",
      "/Contact.js": "contact",
    });
  });
});

describe("useBuilderStore.seedProjectFiles", () => {
  it("merges streamed files, opens them, and reveals the code pane", () => {
    seedProject();

    useBuilderStore.getState().seedProjectFiles({
      "/App.js": "app",
      "/Hero.jsx": "hero",
    });

    expect(project().files).toMatchObject({
      "/App.js": "app",
      "/Hero.jsx": "hero",
    });
    expect(project().activeFile).toBe("/App.js");
    expect(project().openFiles).toEqual(
      expect.arrayContaining(["/App.js", "/Hero.jsx"])
    );
    expect(project().isCodePaneOpen).toBe(true);
    expect(project().viewMode).toBe("split");
  });

  it("keeps files already in the project and the active file without /App.js", () => {
    seedProject({ files: { "/App.js": "app", "/Keep.jsx": "keep" } });

    useBuilderStore.getState().seedProjectFiles({ "/Hero.jsx": "hero" });

    expect(project().files["/Keep.jsx"]).toBe("keep");
    expect(project().activeFile).toBe("/App.js");
  });
});

describe("useBuilderStore.exportProject", () => {
  it("builds and downloads the project zip", () => {
    const createObjectURL = vi.fn(() => "blob:fake");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });
    vi.useFakeTimers();
    seedProject({ files: { "/App.js": "export default () => null;" } });

    useBuilderStore.getState().exportProject("My Site");

    expect(createObjectURL).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("reports a failed export without throwing", () => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: () => {
        throw new Error("nope");
      },
    });
    seedProject();

    expect(() => useBuilderStore.getState().exportProject()).not.toThrow();
  });
});

describe("useBuilderStore persistence", () => {
  it("strips chat from the persisted snapshot and round-trips projects", async () => {
    const options = useBuilderStore.persist.getOptions();
    seedProject({ files: { "/App.js": "persisted" } });
    useBuilderStore.getState().addMessage({ sender: "user", content: "hi" });

    const state = useBuilderStore.getState();
    const partialized = options.partialize
      ? (options.partialize(state) as {
          projects: Record<string, BuilderProject>;
        })
      : { projects: state.projects };
    expect(partialized.projects[PORTFOLIO].messages).toEqual([]);

    setActiveUserId("builder-user");
    await options.storage?.setItem("n", { state: partialized, version: 0 });
    const restored = await options.storage?.getItem("n");

    expect(restored?.state.projects[PORTFOLIO].files["/App.js"]).toBe(
      "persisted"
    );
  });
});

describe("applyGeneratedDesign link", () => {
  it("seeds the active portfolio's code project", () => {
    seedDraft();

    useSketchBuilderStore.getState().applyGeneratedDesign({
      id: "d1",
      routes: ["/"],
      createdAt: new Date().toISOString(),
      themeUsed: {} as never,
      wireframeSummary: { elementCount: 0, detectedLayout: "", sections: [] },
      files: {
        "/App.js": "export default function App() { return <h1>Hi</h1>; }",
      },
      previewType: "code",
    });

    expect(project().files["/App.js"]).toBe(
      "export default function App() { return <h1>Hi</h1>; }"
    );
  });

  it("appends route files without dropping existing pages", () => {
    seedDraft();
    seedProject({ files: { "/App.js": "old", "/Home.js": "home" } });

    useBuilderStore
      .getState()
      .appendGeneratedFiles(
        { "/App.js": "new-router", "/Contact.js": "contact" },
        "Added /contact"
      );

    expect(project().files).toEqual({
      "/App.js": "new-router",
      "/Home.js": "home",
      "/Contact.js": "contact",
    });
  });
});
