// @vitest-environment jsdom
import { strFromU8, unzipSync } from "fflate";
import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadZip, generateProjectZip } from "@/lib/zipExporter";

const readZip = (bytes: Uint8Array): Record<string, string> =>
  Object.fromEntries(
    Object.entries(unzipSync(bytes)).map(([path, data]) => [
      path,
      strFromU8(data),
    ])
  );

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("generateProjectZip", () => {
  it("scaffolds a full runnable project when given no files", () => {
    const files = readZip(generateProjectZip("My Site", {}));

    expect(Object.keys(files).sort()).toEqual(
      [
        "README.md",
        "index.html",
        "package.json",
        "postcss.config.js",
        "src/main.jsx",
        "src/styles.css",
        "tailwind.config.js",
        "vite.config.js",
      ].sort()
    );
    expect(JSON.parse(files["package.json"]).name).toBe("my-site");
    expect(files["index.html"]).toContain('src="/src/main.jsx"');
  });

  it("falls back to a safe project name for an empty/symbol-only name", () => {
    const files = readZip(generateProjectZip("!!!", {}));
    expect(JSON.parse(files["package.json"]).name).toBe("portfolio-project");
    expect(files["README.md"]).toContain("# !!!");
  });

  it("honours provided files and remaps explicit virtual paths", () => {
    const files = readZip(
      generateProjectZip("Site", {
        "/package.json": '{"name":"provided"}',
        "/index.js": "// custom main",
        "/App.js": "// app",
        "/styles.css": ".x{}",
        "/tailwind.config.js": "// tw",
        "/vite.config.js": "// vite",
        "/components/Hero.jsx": "hero",
        "/public/robots.txt": "robots",
      })
    );

    expect(files["package.json"]).toBe('{"name":"provided"}');
    expect(files["src/main.jsx"]).toBe("// custom main");
    expect(files["src/App.jsx"]).toBe("// app");
    expect(files["src/styles.css"]).toBe(".x{}");
    expect(files["tailwind.config.js"]).toBe("// tw");
    expect(files["vite.config.js"]).toBe("// vite");
    expect(files["src/components/Hero.jsx"]).toBe("hero");
    expect(files["public/robots.txt"]).toBe("robots");
  });

  it("injects the module script into provided html", () => {
    const withBody = readZip(
      generateProjectZip("S", {
        "/public/index.html": "<html><body></body></html>",
      })
    );
    expect(withBody["index.html"]).toContain(
      '<script type="module" src="/src/main.jsx"></script>'
    );

    const withoutBody = readZip(
      generateProjectZip("S", { "/public/index.html": "<html></html>" })
    );
    expect(withoutBody["index.html"]).toContain(
      '<script type="module" src="/src/main.jsx"></script>'
    );

    const alreadyLinked = readZip(
      generateProjectZip("S", {
        "/public/index.html":
          '<html><body><script src="/src/main.jsx"></script></body></html>',
      })
    );
    expect(
      alreadyLinked["index.html"].match(/src="\/src\/main.jsx"/g)
    ).toHaveLength(1);
  });

  it("remaps a bare main.jsx and a bare index.html", () => {
    const files = readZip(
      generateProjectZip("S", {
        "main.jsx": "// main",
        "index.html": "<html></html>",
      })
    );
    // A provided main.jsx becomes the entry and index.html is normalized.
    expect(files["src/main.jsx"]).toBe("// main");
    expect(files["index.html"]).toBeDefined();
  });
});

describe("downloadZip", () => {
  it("downloads a sanitized zip and revokes the object URL", () => {
    const createObjectURL = vi.fn(() => "blob:fake");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    vi.useFakeTimers();

    downloadZip("My Cool Site!!", new Uint8Array([1, 2, 3]));

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    const anchor = click.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("my-cool-site.zip");

    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake");
  });
});
