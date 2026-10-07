import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TThemePreset } from "@/components/theme/themes.types.ts";
import { BUILT_IN_ACCENTS, BUILT_IN_BASES } from "@/lib/theme/theme-preset.ts";
import { useThemeStore } from "@/store/themeStore.ts";

const BASE = BUILT_IN_BASES[0] as TThemePreset;
const OTHER_BASE = BUILT_IN_BASES[1] as TThemePreset;
const ACCENT = BUILT_IN_ACCENTS[0] as TThemePreset;

const INITIAL = useThemeStore.getState();

const makeUserPreset = (
  overrides: Partial<TThemePreset> = {}
): TThemePreset => ({
  builtIn: false,
  createdAt: 1,
  dark: { "--primary": "dark-value" },
  id: "user-1",
  light: { "--primary": "light-value" },
  name: "Mine",
  radius: "1rem",
  ...overrides,
});

beforeEach(() => {
  useThemeStore.setState(INITIAL);
  document.documentElement.classList.remove("light", "dark");
});

describe("theme", () => {
  it("sets the mode and toggles the root class", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    useThemeStore.getState().setTheme("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("resolves the system theme to a concrete class", () => {
    useThemeStore.getState().setTheme("system");
    expect(useThemeStore.getState().theme).toBe("system");
    expect(
      document.documentElement.classList.contains("light") ||
        document.documentElement.classList.contains("dark")
    ).toBe(true);
  });
});

describe("base and accent presets", () => {
  it("applies a known base preset", () => {
    useThemeStore.getState().setBasePreset(BASE.id);
    const state = useThemeStore.getState();

    expect(state.activeBaseId).toBe(BASE.id);
    expect(state.activePresetId).toBe(BASE.id);
    expect(state.radius).toBe(BASE.radius);
    expect(state.light).toEqual(BASE.light);
    expect(state.isDirty).toBe(false);
  });

  it("ignores an unknown base preset", () => {
    const before = useThemeStore.getState().activeBaseId;
    useThemeStore.getState().setBasePreset("nope");
    expect(useThemeStore.getState().activeBaseId).toBe(before);
  });

  it("merges an accent over the base and clears it again", () => {
    useThemeStore.getState().setBasePreset(BASE.id);
    useThemeStore.getState().setAccentPreset(ACCENT.id);

    let state = useThemeStore.getState();
    expect(state.activeAccentId).toBe(ACCENT.id);
    expect(state.activePresetId).toBe(`${BASE.id}+${ACCENT.id}`);
    expect(state.radius).toBe(ACCENT.radius);

    useThemeStore.getState().setAccentPreset(null);
    state = useThemeStore.getState();
    expect(state.activeAccentId).toBeNull();
    expect(state.activePresetId).toBe(BASE.id);
  });

  it("keeps the active accent when applying another base", () => {
    useThemeStore.getState().setAccentPreset(ACCENT.id);
    useThemeStore.getState().setBasePreset(OTHER_BASE.id);

    const state = useThemeStore.getState();
    expect(state.activeBaseId).toBe(OTHER_BASE.id);
    expect(state.activeAccentId).toBe(ACCENT.id);
    expect(state.activePresetId).toBe(`${OTHER_BASE.id}+${ACCENT.id}`);
  });

  it("ignores an accent when the active base is unknown", () => {
    useThemeStore.setState({ activeBaseId: "nope" });
    useThemeStore.getState().setAccentPreset(ACCENT.id);
    expect(useThemeStore.getState().activeAccentId).toBeNull();
  });
});

describe("manual edits", () => {
  it("flags dirty on light, dark and radius edits", () => {
    useThemeStore.getState().updateLightVar("--x", "light-x");
    useThemeStore.getState().updateDarkVar("--x", "dark-x");
    useThemeStore.getState().updateRadius("2rem");

    const state = useThemeStore.getState();
    expect(state.light["--x"]).toBe("light-x");
    expect(state.dark["--x"]).toBe("dark-x");
    expect(state.radius).toBe("2rem");
    expect(state.isDirty).toBe(true);
  });
});

describe("loadPreset", () => {
  it("loads an accent preset with the default base", () => {
    useThemeStore.getState().loadPreset(ACCENT);
    const state = useThemeStore.getState();

    expect(state.activeAccentId).toBe(ACCENT.id);
    expect(state.light).toEqual(ACCENT.light);
    expect(state.radius).toBe(ACCENT.radius);
  });

  it("loads a base preset and keeps the active accent", () => {
    useThemeStore.getState().setAccentPreset(ACCENT.id);
    useThemeStore.getState().loadPreset(OTHER_BASE);
    const state = useThemeStore.getState();

    expect(state.activeBaseId).toBe(OTHER_BASE.id);
    expect(state.activeAccentId).toBe(ACCENT.id);
    expect(state.activePresetId).toBe(`${OTHER_BASE.id}+${ACCENT.id}`);
  });

  it("loads a user preset without adding it", () => {
    const preset = makeUserPreset();
    useThemeStore.getState().loadPreset(preset);
    const state = useThemeStore.getState();

    expect(state.activePresetId).toBe(preset.id);
    expect(state.light).toEqual(preset.light);
    expect(state.userPresets).toHaveLength(0);
  });

  it("loads a base preset without an active accent", () => {
    useThemeStore.getState().loadPreset(OTHER_BASE);
    const state = useThemeStore.getState();

    expect(state.activeBaseId).toBe(OTHER_BASE.id);
    expect(state.activeAccentId).toBeNull();
    expect(state.radius).toBe(OTHER_BASE.radius);
  });
});

describe("user preset management", () => {
  it("saves the current theme as a preset", () => {
    const preset = useThemeStore.getState().saveCurrentAsPreset("Saved");
    const state = useThemeStore.getState();

    expect(preset.name).toBe("Saved");
    expect(preset.builtIn).toBe(false);
    expect(state.userPresets).toContainEqual(preset);
    expect(state.activePresetId).toBe(preset.id);
    expect(state.isDirty).toBe(false);
  });

  it("renames and deletes a user preset", () => {
    const preset = useThemeStore.getState().saveCurrentAsPreset("Old");
    useThemeStore.getState().renameUserPreset(preset.id, "New");
    expect(useThemeStore.getState().userPresets[0]?.name).toBe("New");

    useThemeStore.getState().deleteUserPreset(preset.id);
    const state = useThemeStore.getState();
    expect(state.userPresets).toHaveLength(0);
    expect(state.activePresetId).toBeNull();
  });

  it("leaves the active preset when deleting another", () => {
    const active = useThemeStore.getState().saveCurrentAsPreset("Active");
    const other = useThemeStore.getState().saveCurrentAsPreset("Other");
    useThemeStore.setState({ activePresetId: active.id });

    useThemeStore.getState().deleteUserPreset(other.id);
    expect(useThemeStore.getState().activePresetId).toBe(active.id);
  });

  it("ignores renaming an unknown preset id", () => {
    const preset = useThemeStore.getState().saveCurrentAsPreset("Keep");
    useThemeStore.getState().renameUserPreset("missing", "Nope");
    expect(useThemeStore.getState().userPresets[0]?.name).toBe("Keep");
    expect(useThemeStore.getState().userPresets[0]?.id).toBe(preset.id);
  });
});

describe("revertToPreset", () => {
  it("restores a dirty user preset from its snapshot", () => {
    const preset = makeUserPreset();
    useThemeStore.setState({
      activePresetId: preset.id,
      userPresets: [preset],
    });
    useThemeStore.getState().updateLightVar("--x", "dirty");

    useThemeStore.getState().revertToPreset();
    const state = useThemeStore.getState();

    expect(state.light).toEqual(preset.light);
    expect(state.isDirty).toBe(false);
  });

  it("recomputes a dirty built-in preset", () => {
    useThemeStore.getState().setBasePreset(BASE.id);
    useThemeStore.getState().updateLightVar("--x", "dirty");

    useThemeStore.getState().revertToPreset();
    const state = useThemeStore.getState();

    expect(state.light).toEqual(BASE.light);
    expect(state.activePresetId).toBe(BASE.id);
  });

  it("does nothing when the base is unknown", () => {
    useThemeStore.setState({ activeAccentId: null, activeBaseId: "nope" });
    useThemeStore.getState().revertToPreset();
    expect(useThemeStore.getState().activeBaseId).toBe("nope");
  });

  it("recomputes a dirty built-in preset that has an accent", () => {
    useThemeStore.getState().setBasePreset(BASE.id);
    useThemeStore.getState().setAccentPreset(ACCENT.id);
    useThemeStore.getState().updateLightVar("--x", "dirty");

    useThemeStore.getState().revertToPreset();
    const state = useThemeStore.getState();

    expect(state.isDirty).toBe(false);
    expect(state.activeAccentId).toBe(ACCENT.id);
    expect(state.activePresetId).toBe(`${BASE.id}+${ACCENT.id}`);
  });
});

describe("exportPresets", () => {
  it("serialises user presets and triggers a download", () => {
    const createObjectURL = vi.fn(() => "blob:url");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    useThemeStore.getState().exportPresets();

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:url");
    click.mockRestore();
    vi.unstubAllGlobals();
  });
});

describe("importPresets", () => {
  const asFile = (value: unknown): File =>
    ({ text: () => Promise.resolve(JSON.stringify(value)) }) as File;

  it("merges presets with unknown ids", async () => {
    const preset = makeUserPreset();
    await useThemeStore.getState().importPresets(asFile([preset]));
    expect(useThemeStore.getState().userPresets).toContainEqual(preset);
  });

  it("skips presets whose ids already exist", async () => {
    const preset = useThemeStore.getState().saveCurrentAsPreset("Existing");
    await useThemeStore.getState().importPresets(asFile([preset]));
    expect(useThemeStore.getState().userPresets).toHaveLength(1);
  });

  it("rejects a non-array payload", async () => {
    await expect(
      useThemeStore.getState().importPresets(asFile({}))
    ).rejects.toBeInstanceOf(TypeError);
  });
});
