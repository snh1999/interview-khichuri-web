import { describe, expect, it } from "vitest";
import { sanitizeSandpackFiles } from "@/lib/sandpack.ts";

describe("sanitizeSandpackFiles", () => {
  it("strips unresolvable Tailwind directives from CSS", () => {
    const result = sanitizeSandpackFiles({
      "/styles.css":
        "@import 'tailwindcss';\n\n@tailwind base;\n\n:root {\n  color: red;\n}\n",
      "/App.js": "export default function App() {\n  return null;\n}\n",
    });

    expect(result["/styles.css"]).toBe(":root {\n  color: red;\n}");
    expect(result["/styles.css"]).not.toContain("tailwind");
    expect(result["/App.js"]).toBe(
      "export default function App() {\n  return null;\n}\n"
    );
  });

  it("returns the same map reference when there is nothing to clean", () => {
    const files = {
      "/styles.css": ".btn {\n  color: red;\n}\n",
      "/App.js": "export default null;\n",
    };

    expect(sanitizeSandpackFiles(files)).toBe(files);
  });
});
