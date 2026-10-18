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

  it("scaffolds a project whose .js JSX and router imports actually build", () => {
    const files = readZip(
      generateProjectZip("Site", {
        "/App.js": "export default function App() { return <div />; }",
        "/main.jsx":
          "import { BrowserRouter } from 'react-router-dom';\nexport default BrowserRouter;",
      })
    );

    expect(JSON.parse(files["package.json"]).dependencies).toHaveProperty(
      "react-router-dom"
    );
    expect(files["vite.config.js"]).toContain("loader: 'jsx'");
    expect(files["vite.config.js"]).toContain("/src\\/.*\\.jsx?$/");
  });

  it("adds Tailwind directives to a provided stylesheet that lacks them", () => {
    const files = readZip(
      generateProjectZip("Site", { "/styles.css": ".btn { color: red; }" })
    );
    expect(files["src/styles.css"]).toBe(
      "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n.btn { color: red; }"
    );
  });

  it("leaves a stylesheet that already has Tailwind directives untouched", () => {
    const css =
      "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n.custom{}";
    const files = readZip(generateProjectZip("Site", { "/styles.css": css }));
    expect(files["src/styles.css"]).toBe(css);
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
    expect(files["src/main.jsx"]).toContain("// custom main");
    expect(files["src/App.js"]).toBe("// app");
    expect(files["src/styles.css"]).toContain("@tailwind base;");
    expect(files["src/styles.css"]).toContain(".x{}");
    expect(files["tailwind.config.js"]).toBe("// tw");
    expect(files["vite.config.js"]).toBe("// vite");
    expect(files["src/components/Hero.jsx"]).toBe("hero");
    expect(files["public/robots.txt"]).toBe("robots");
  });

  it("loads the Tailwind stylesheet from a supplied entry", () => {
    const injected = readZip(
      generateProjectZip("S", {
        "/index.js": 'import App from "./App";\nexport default App;',
      })
    );
    expect(injected["src/main.jsx"]).toContain("import './styles.css';");

    const already = readZip(
      generateProjectZip("S", {
        "/index.js": "import './styles.css';\nexport default null;",
      })
    );
    expect(
      already["src/main.jsx"].match(/import '\.\/styles\.css';/g)
    ).toHaveLength(1);
  });

  it("keeps the entry's own .js imports resolvable", () => {
    const files = readZip(
      generateProjectZip("Site", {
        "/index.js": 'import App from "./App.js";\nexport default App;',
        "/App.js": "// app",
      })
    );

    expect(files["src/App.js"]).toBe("// app");
    expect(files["src/main.jsx"]).toContain('from "./App.js"');
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
    expect(files["src/main.jsx"]).toContain("// main");
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
