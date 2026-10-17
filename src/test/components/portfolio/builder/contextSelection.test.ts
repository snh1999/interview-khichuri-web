import { describe, expect, it } from "vitest";
import { selectBuilderContext } from "@/components/portfolio/builder/contextSelection";

const HASH_PATTERN = /^[0-9a-f]{8}$/;

describe("selectBuilderContext", () => {
  it("sends the whole project and a full manifest when it is small", () => {
    const files = {
      "/App.js": "export default () => null;",
      "/components/Hero.js": "export default () => null;",
    };

    const { manifest, files: sent } = selectBuilderContext(files, {
      prompt: "make it pop",
    });

    expect(manifest.map((entry) => entry.path)).toEqual([
      "/App.js",
      "/components/Hero.js",
    ]);
    expect(manifest[0].size).toBe(files["/App.js"].length);
    expect(manifest[0].hash).toMatch(HASH_PATTERN);
    expect(sent).toEqual(files);
  });

  it("sends only the always-included and mentioned files for a large project", () => {
    const filler = "x".repeat(40_000);
    const files: Record<string, string> = {
      "/App.js": "export default () => null;",
      "/components/Hero.js": filler,
      "/components/Footer.js": filler,
      "/components/Unrelated.js": filler,
    };

    const { manifest, files: sent } = selectBuilderContext(files, {
      prompt: "Update the Footer",
    });

    expect(manifest).toHaveLength(4);
    expect(Object.keys(sent).sort()).toEqual([
      "/App.js",
      "/components/Footer.js",
    ]);
  });

  it("always includes the active file and open files", () => {
    const filler = "x".repeat(40_000);
    const files: Record<string, string> = {
      "/App.js": "export default () => null;",
      "/components/Hero.js": filler,
      "/components/Footer.js": filler,
    };

    const { files: sent } = selectBuilderContext(files, {
      prompt: "tweak the spacing",
      activeFile: "/components/Hero.js",
      openFiles: ["/components/Footer.js"],
    });

    expect(Object.keys(sent).sort()).toEqual([
      "/App.js",
      "/components/Footer.js",
      "/components/Hero.js",
    ]);
  });
});
