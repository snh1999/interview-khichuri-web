import { afterEach, describe, expect, it } from "vitest";
import {
  injectThemeVariables,
  removeThemeOverride,
} from "@/lib/theme/theme-inject.ts";

const STYLE_ID = "khichuri-theme-override";

afterEach(() => {
  removeThemeOverride();
});

describe("injectThemeVariables", () => {
  it("creates a style tag with light, dark and radius blocks", () => {
    injectThemeVariables({
      dark: { background: "black" },
      light: { "--primary": "red" },
      radius: "0.5rem",
    });

    const style = document.querySelector(`#${STYLE_ID}`);
    expect(style?.textContent).toContain(":root {");
    expect(style?.textContent).toContain("--primary: red;");
    expect(style?.textContent).toContain("--radius: 0.5rem;");
    expect(style?.textContent).toContain(".dark {");
    expect(style?.textContent).toContain("--background: black;");
  });

  it("sanitizes variable names and strips dangerous characters", () => {
    injectThemeVariables({
      dark: {},
      light: { "bad key!": "value" },
      radius: "1rem; }",
    });

    const text = document.querySelector(`#${STYLE_ID}`)?.textContent ?? "";
    expect(text).toContain("--badkey: value;");
    expect(text).toContain("--radius: 1rem ;");
    expect(text).not.toContain("1rem; }");
  });

  it("reuses the existing tag on re-injection", () => {
    injectThemeVariables({ dark: {}, light: {}, radius: "1rem" });
    injectThemeVariables({ dark: {}, light: {}, radius: "2rem" });

    expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
  });
});

describe("removeThemeOverride", () => {
  it("removes the injected tag and is safe to call twice", () => {
    injectThemeVariables({ dark: {}, light: {}, radius: "1rem" });
    removeThemeOverride();
    expect(document.querySelector(`#${STYLE_ID}`)).toBeNull();
    removeThemeOverride();
  });
});
