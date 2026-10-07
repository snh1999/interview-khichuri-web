import { afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_CURRENT_KEY } from "@/components/theme/themes.types.ts";

const STYLE_ID = "khichuri-theme-override";
const THEME = {
  dark: { background: "black" },
  light: { primary: "red" },
  radius: "0.5rem",
};

const loadModule = async () => {
  vi.resetModules();
  await import("@/lib/theme/theme-inject.ts");
};

afterEach(() => {
  localStorage.clear();
  document.querySelector(`#${STYLE_ID}`)?.remove();
  vi.restoreAllMocks();
});

describe("theme init on load", () => {
  it("does nothing when no theme is stored", async () => {
    await loadModule();
    expect(document.querySelector(`#${STYLE_ID}`)).toBeNull();
  });

  it("injects a valid theme stored under state", async () => {
    localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify({ state: THEME }));
    await loadModule();

    const text = document.querySelector(`#${STYLE_ID}`)?.textContent ?? "";
    expect(text).toContain("--background: black;");
    expect(text).toContain("--radius: 0.5rem;");
  });

  it("injects a valid theme stored at the root", async () => {
    localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(THEME));
    await loadModule();
    expect(document.querySelector(`#${STYLE_ID}`)).not.toBeNull();
  });

  it("ignores a theme whose shape is invalid", async () => {
    localStorage.setItem(
      STORAGE_CURRENT_KEY,
      JSON.stringify({ light: {}, radius: "1rem" })
    );
    await loadModule();
    expect(document.querySelector(`#${STYLE_ID}`)).toBeNull();
  });

  it("ignores a non-object payload", async () => {
    localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(42));
    await loadModule();
    expect(document.querySelector(`#${STYLE_ID}`)).toBeNull();
  });

  it("logs and swallows malformed json", async () => {
    const errorSpy = vi.spyOn(console, "error").mockReturnValue(undefined);
    localStorage.setItem(STORAGE_CURRENT_KEY, "{not json");
    await loadModule();

    expect(errorSpy).toHaveBeenCalled();
    expect(document.querySelector(`#${STYLE_ID}`)).toBeNull();
  });
});
