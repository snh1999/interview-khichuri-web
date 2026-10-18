import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiTransformModal } from "@/components/portfolio/sketch/AiTransformModal.tsx";
import type { Portfolio } from "@/components/portfolio/sketch/types";
import { DEFAULT_THEMES } from "@/components/portfolio/sketch/utils/defaultPortfolios.ts";
import { Toaster } from "@/components/ui/sonner.tsx";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore.ts";
import { useBuilderStore } from "@/store/useBuilderStore.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";
const PORTFOLIO = "p-1";
const RE_TWO_MODULES = /Detected Wireframe Modules \(2 elements\)/;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const withProvider = () =>
  server.use(
    http.get(`${API}/ai/api-keys`, () =>
      envelope([
        {
          createdAt: "2024-01-01",
          id: "k-1",
          isActive: true,
          name: "OpenAI",
          provider: "openai",
          updatedAt: "2024-01-01",
          userId: "u-1",
        },
      ])
    )
  );

const seedEmptyPortfolio = () => {
  const portfolio: Portfolio = {
    id: PORTFOLIO,
    title: "Untitled Portfolio",
    description: "",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    elements: [],
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

const frame = (id: string, title: string, route: string) => ({
  id,
  type: "frame" as const,
  title,
  route,
  preset: "desktop" as const,
  x: 0,
  y: 0,
  width: 1040,
  height: 720,
  zIndex: 1,
});

const seedPortfolioWithFrames = () => {
  const portfolio: Portfolio = {
    id: PORTFOLIO,
    title: "Untitled Portfolio",
    description: "",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    elements: [
      frame("f1", "Home Desktop", "/"),
      frame("f2", "Home Mobile", "/"),
    ] as Portfolio["elements"],
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

const seedPortfolioWithStamp = () => {
  const portfolio: Portfolio = {
    id: PORTFOLIO,
    title: "Untitled Portfolio",
    description: "",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    elements: [
      frame("f1", "Home Desktop", "/"),
      {
        id: "s1",
        type: "stamp",
        stampType: "hero",
        x: 10,
        y: 10,
        width: 100,
        height: 50,
        frameId: "f1",
        zIndex: 2,
      },
    ] as Portfolio["elements"],
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
  useBuilderStore.setState(useBuilderStore.getInitialState(), true);
  useSketchBuilderStore.setState({
    draft: null,
    viewMode: "canvas",
  });
});

describe("AiTransformModal without a sketch", () => {
  it("generates a full site from the prompt and opens the Code Builder", async () => {
    withProvider();
    seedEmptyPortfolio();
    const { user } = render(<AiTransformModal isOpen onClose={vi.fn()} />);

    expect(
      await screen.findByText("No Artboards on Canvas")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Generate Portfolio" })
    );

    await waitFor(() =>
      expect(
        useBuilderStore.getState().projects[PORTFOLIO]?.files["/App.js"]
      ).toBe("export default function App() { return null; }")
    );
    expect(useSketchBuilderStore.getState().viewMode).toBe("preview");
  });
});

describe("AiTransformModal multi-select sketch", () => {
  it("sends every selected artboard and seeds the generated file map", async () => {
    withProvider();
    seedPortfolioWithFrames();
    expect(useSketchBuilderStore.getState().draft?.elements).toHaveLength(2);
    let sentFrames: unknown[] = [];
    server.use(
      http.post(`${API}/portfolio/sketch`, async ({ request }) => {
        const body = (await request.json()) as { frames: unknown[] };
        sentFrames = body.frames;
        return envelope({
          id: "design-1",
          routes: ["/"],
          createdAt: "2024-01-01",
          prompt: "",
          themeUsed: {},
          wireframeSummary: {
            elementCount: 0,
            detectedLayout: "",
            sections: [],
          },
          files: {
            "/App.js": "export default function App() { return null; }",
            "/Home.js": "// home",
          },
          previewType: "interactive",
        });
      })
    );

    const { user } = render(<AiTransformModal isOpen onClose={vi.fn()} />);
    await user.click(await screen.findByRole("button", { name: "Select all" }));
    await user.click(
      screen.getByRole("button", { name: "Generate Portfolio" })
    );

    await waitFor(() => expect(sentFrames).toHaveLength(2));
    await waitFor(() =>
      expect(
        useBuilderStore.getState().projects[PORTFOLIO]?.files["/Home.js"]
      ).toBe("// home")
    );
  });
});

describe("AiTransformModal empty state", () => {
  it("adds a default artboard frame to the canvas", async () => {
    withProvider();
    seedEmptyPortfolio();
    const { user } = render(
      <>
        <AiTransformModal isOpen onClose={vi.fn()} />
        <Toaster />
      </>
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Create Desktop Frame (1040x720)",
      })
    );

    const elements = useSketchBuilderStore.getState().draft?.elements ?? [];
    expect(elements).toHaveLength(1);
    expect(elements[0]).toMatchObject({ type: "frame", title: "Home Page" });
    expect(
      await screen.findByText("Select Artboards to Transform")
    ).toBeInTheDocument();
  });
});

describe("AiTransformModal frame targeting", () => {
  it("preselects the target frame and reports detected wireframe modules", async () => {
    withProvider();
    seedPortfolioWithStamp();
    render(<AiTransformModal isOpen onClose={vi.fn()} targetFrameId="f1" />);

    expect(await screen.findByText(RE_TWO_MODULES)).toBeInTheDocument();
    expect(screen.getByText("hero")).toBeInTheDocument();
  });

  it("disables generation while no artboard is selected", async () => {
    withProvider();
    seedPortfolioWithFrames();
    render(<AiTransformModal isOpen onClose={vi.fn()} />);

    await screen.findByText("Select Artboards to Transform");
    expect(
      screen.getByRole("button", { name: "Generate Portfolio" })
    ).toBeDisabled();
  });

  it("warns instead of calling the API when the target frame vanished", async () => {
    withProvider();
    seedPortfolioWithFrames();
    let sketchCalls = 0;
    server.use(
      http.post(`${API}/portfolio/sketch`, () => {
        sketchCalls += 1;
        return envelope({});
      })
    );

    const { user } = render(
      <>
        <AiTransformModal isOpen onClose={vi.fn()} targetFrameId="ghost" />
        <Toaster />
      </>
    );

    await screen.findByText("Select Artboards to Transform");
    const generate = screen.getByRole("button", {
      name: "Generate Portfolio",
    });
    expect(generate).toBeEnabled();

    await user.click(generate);

    expect(
      await screen.findByText("Please select at least one artboard frame")
    ).toBeInTheDocument();
    expect(sketchCalls).toBe(0);
  });
});

describe("AiTransformModal generation errors", () => {
  it("surfaces the server message when sketch generation fails", async () => {
    withProvider();
    seedPortfolioWithFrames();
    server.use(
      http.post(`${API}/portfolio/sketch`, () =>
        HttpResponse.json(
          { data: null, message: "boom", statusCode: 500 },
          { status: 500 }
        )
      )
    );

    const { user } = render(
      <>
        <AiTransformModal isOpen onClose={vi.fn()} />
        <Toaster />
      </>
    );

    await user.click(await screen.findByRole("button", { name: "Select all" }));
    await user.click(
      screen.getByRole("button", { name: "Generate Portfolio" })
    );

    expect(await screen.findByText("boom")).toBeInTheDocument();
  });
});

describe("AiTransformModal append mode", () => {
  it("uses append labels for the title and execute action", async () => {
    withProvider();
    seedPortfolioWithFrames();
    render(<AiTransformModal isOpen mode="append" onClose={vi.fn()} />);

    expect(
      await screen.findByText("Add Page to Portfolio")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Page" })
    ).toBeInTheDocument();
  });
});
